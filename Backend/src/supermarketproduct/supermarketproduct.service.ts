import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupermarketProductDto } from './dto/create-supermarketproduct.dto';
import { GetSupermarketProductDto } from './dto/get-supermarketproduct.dto';
import { normalizeUnit } from 'src/utils';

@Injectable()
export class SupermarketProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createSupermarketProduct(
    data: CreateSupermarketProductDto & { userId: string },
  ) {
    const { supermarketId, brandProductId, unit, price, inStock, userId } =
      data;

    const normalizedUnit = normalizeUnit(unit);

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
            unit: normalizedUnit,
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
      console.error('Error creating supermarket product:', error);
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

  async getSupermarketProductById(id: string) {
    try {
      const supermarketProduct =
        await this.prisma.supermarketProduct.findUnique({
          where: { id },
          include: {
            supermarket: true,
            brandProduct: {
              include: {
                brand: true,
                product: true,
              },
            },
            contributions: true,
          },
        });

      return supermarketProduct;
    } catch (error) {
      console.error('Error in getSupermarketProductById:', error);
      throw new HttpException(
        'Failed to retrieve supermarket product.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

    const normalizedUnit = unit ? normalizeUnit(unit) : undefined; // Normalize unit
    const skip = Math.max(0, (page - 1) * limit);
    const take = Math.max(1, limit);

    try {
      const results = await this.prisma.supermarketProduct.findMany({
        where: {
          supermarket: {
            city,
            ...(supermarketName && {
              name: { contains: supermarketName, mode: 'insensitive' },
            }),
          },
          ...(productName && {
            brandProduct: {
              product: { name: { contains: productName, mode: 'insensitive' } },
            },
          }),
          ...(brandName && {
            brandProduct: {
              brand: { name: { contains: brandName, mode: 'insensitive' } },
            },
          }),
          ...(normalizedUnit && { unit: normalizedUnit }), // Use normalized unit here
          ...(typeof inStock === 'boolean' && { inStock }),
        },
        orderBy: { price: 'asc' },
        skip,
        take,
        include: {
          supermarket: true,
          brandProduct: { include: { brand: true, product: true } },
        },
      });

      const totalItems = await this.prisma.supermarketProduct.count({
        where: {
          supermarket: {
            city,
            ...(supermarketName && {
              name: { contains: supermarketName, mode: 'insensitive' },
            }),
          },
          ...(productName && {
            brandProduct: {
              product: { name: { contains: productName, mode: 'insensitive' } },
            },
          }),
          ...(brandName && {
            brandProduct: {
              brand: { name: { contains: brandName, mode: 'insensitive' } },
            },
          }),
          ...(normalizedUnit && { unit: normalizedUnit }), // Normalize unit here too
          ...(typeof inStock === 'boolean' && { inStock }),
        },
      });

      const formattedResults = results.map((item) => ({
        product: `${item.brandProduct.brand.name} ${item.brandProduct.product.name} ${item.unit}`,
        location: `${item.supermarket.name}, ${item.supermarket.city}`,
        price: `$${item.price.toFixed(2)}`,
      }));

      return {
        data: formattedResults,
        meta: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      console.error('Error in getSupermarketProducts:', error);
      throw new HttpException(
        'Failed to retrieve supermarket products.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
