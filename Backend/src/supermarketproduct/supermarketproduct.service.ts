import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupermarketProductDto } from './dto/create-supermarketproduct.dto';
import { GetSupermarketProductDto } from './dto/get-supermarketproduct.dto';

@Injectable()
export class SupermarketProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createSupermarketProduct(
    data: CreateSupermarketProductDto & { userId: string },
  ) {
    const { supermarketId, brandProductId, unit, price, inStock, userId } =
      data;

    const supermarketExists = await this.prisma.supermarket.findUnique({
      where: { id: supermarketId },
    });
    if (!supermarketExists) {
      throw new HttpException('Supermarket not found.', HttpStatus.NOT_FOUND);
    }

    const brandProductExists = await this.prisma.brandProduct.findUnique({
      where: { id: brandProductId },
    });
    if (!brandProductExists) {
      throw new HttpException('Brand Product not found.', HttpStatus.NOT_FOUND);
    }

    try {
      return await this.prisma.$transaction(async (prisma) => {
        const createdProduct = await prisma.supermarketProduct.create({
          data: {
            supermarketId,
            brandProductId,
            unit,
            price,
            inStock,
          },
        });

        await prisma.productContribution.create({
          data: {
            userId,
            supermarketProductId: createdProduct.id,
            type: 'NEW_PRODUCT',
            newValue: {
              price,
              inStock,
            },
          },
        });

        return createdProduct;
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new HttpException(
          'A product with the same supermarket, brand product, and unit already exists.',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        'Internal Server Error. Unable to create Supermarket Product.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updatePrice(
    supermarketProductId: string,
    newPrice: number,
    userId: string,
  ) {
    const existingProduct = await this.prisma.supermarketProduct.findUnique({
      where: { id: supermarketProductId },
    });

    if (!existingProduct) {
      throw new HttpException('Product not found.', HttpStatus.NOT_FOUND);
    }

    return await this.prisma.$transaction(async (prisma) => {
      const updatedProduct = await prisma.supermarketProduct.update({
        where: { id: supermarketProductId },
        data: { price: newPrice },
      });

      await prisma.productContribution.create({
        data: {
          userId,
          supermarketProductId,
          type: 'PRICE_UPDATE',
          oldValue: { price: existingProduct.price },
          newValue: { price: newPrice },
        },
      });

      return updatedProduct;
    });
  }
  async updateStockStatus(
    supermarketProductId: string,
    inStock: boolean,
    userId: string,
  ) {
    const existingProduct = await this.prisma.supermarketProduct.findUnique({
      where: { id: supermarketProductId },
    });

    if (!existingProduct) {
      throw new HttpException('Product not found.', HttpStatus.NOT_FOUND);
    }

    return await this.prisma.$transaction(async (prisma) => {
      const updatedProduct = await prisma.supermarketProduct.update({
        where: { id: supermarketProductId },
        data: { inStock },
      });

      await prisma.productContribution.create({
        data: {
          userId,
          supermarketProductId,
          type: 'AVAILABILITY_UPDATE',
          oldValue: { inStock: existingProduct.inStock },
          newValue: { inStock },
        },
      });

      return updatedProduct;
    });
  }
  async getSupermarketProducts(query: GetSupermarketProductDto) {
    const {
      city,
      supermarketName,
      productName,
      brandName,
      unit,
      inStock,
      page = 1,
      limit = 10,
    } = query;

    // Ensure valid pagination values
    const skip = Math.max(0, (page - 1) * limit);
    const take = Math.max(1, limit);

    try {
      // Fetch the results using Prisma
      const results = await this.prisma.supermarketProduct.findMany({
        where: {
          // Mandatory filter: city
          supermarket: {
            city,
            ...(supermarketName && {
              name: {
                contains: supermarketName,
                mode: 'insensitive',
              },
            }),
          },
          // Optional filter: productName (partial match)
          ...(productName && {
            brandProduct: {
              product: {
                name: {
                  contains: productName,
                  mode: 'insensitive',
                },
              },
            },
          }),
          // Optional filter: brandName (partial match)
          ...(brandName && {
            brandProduct: {
              brand: {
                name: {
                  contains: brandName,
                  mode: 'insensitive',
                },
              },
            },
          }),
          // Optional filter: unit
          ...(unit && {
            unit,
          }),
          // Optional filter: inStock
          ...(typeof inStock === 'boolean' && {
            inStock,
          }),
        },
        orderBy: {
          price: 'asc', // Always sort by price in ascending order
        },
        skip, // Pagination: offset
        take, // Pagination: limit
        include: {
          supermarket: true, // Include related supermarket data
          brandProduct: {
            include: {
              brand: true, // Include related brand data
              product: true, // Include related product data
            },
          },
        },
      });

      // Transform the results into the desired response format
      const formattedResults = results.map((item) => ({
        product: `${item.brandProduct.brand.name} ${item.brandProduct.product.name} ${item.unit}`,
        location: `${item.supermarket.name}, ${item.supermarket.city}`,
        price: `$${item.price.toFixed(2)}`,
      }));

      // Return the transformed results along with pagination metadata
      return {
        data: formattedResults,
        meta: {
          totalItems: results.length, // Replace this with actual count query if needed
          totalPages: Math.ceil(results.length / limit),
          currentPage: page,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      console.error('Error in getSupermarketProducts:', error);
      throw new HttpException(
        'An error occurred while retrieving supermarket products.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
