import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
// import { UpdateBrandproductDto } from './dto/update-brandproduct.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBrandProductDto } from './dto/create-brandproduct.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BrandProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createBrandProduct(data: CreateBrandProductDto) {
    const { brandId, productId } = data;

    // Use the hardcoded unbranded UUID if brandId is not provided
    const unbrandedId = '00000000-0000-0000-0000-UNBRANDED00';
    const brandToUse = brandId || unbrandedId;

    // Check if the product exists
    const productExists = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!productExists) {
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }

    // Check if the brand exists (either provided brandId or unbrandedId)
    const brandExists = await this.prisma.brand.findUnique({
      where: { id: brandToUse },
    });
    if (!brandExists) {
      throw new NotFoundException(`Brand with ID ${brandToUse} not found.`);
    }

    // Create the BrandProduct entry
    try {
      return await this.prisma.brandProduct.create({
        data: {
          brandId: brandToUse,
          productId,
        },
      });
    } catch (error) {
      // Handle unique constraint violations (e.g., duplicate entries)
      if (error.code === 'P2002') {
        throw new ConflictException(
          `A BrandProduct with this brand and product combination already exists.`,
        );
      }
      // Catch any other unexpected errors
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the BrandProduct.',
      );
    }
  }

  async getBrandProducts(
    page: number,
    limit: number,
    filters: { productId?: string; brandId?: string },
  ) {
    const { productId, brandId } = filters;

    try {
      const skip = (page - 1) * limit;

      // Construct the "where" clause dynamically
      const whereClause: Prisma.BrandProductWhereInput = {};
      if (productId) whereClause.productId = productId;
      if (brandId) whereClause.brandId = brandId;

      // Fetch paginated data and total count
      const [brandProducts, total] = await Promise.all([
        this.prisma.brandProduct.findMany({
          where: whereClause,
          skip,
          take: limit,
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            brand: {
              select: {
                id: true,
                name: true, // Include brand name
              },
            },
            product: {
              select: {
                id: true,
                name: true, // Include product name
              },
            },
          },
        }),
        this.prisma.brandProduct.count({ where: whereClause }),
      ]);

      return { brandProducts, total, page, limit };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while retrieving BrandProducts.',
      );
    }
  }

  async getBrandProductById(id: string) {
    try {
      const brandProduct = await this.prisma.brandProduct.findUnique({
        where: { id },
        select: {
          id: true,
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      });

      return brandProduct;
    } catch (error) {
      throw new NotFoundException(`BrandProduct with ID ${id} not found.`);
    }
  }

  // update(id: number, updateBrandproductDto: UpdateBrandproductDto) {
  //   return `This action updates a #${id} brandproduct`;
  // }

  remove(id: number) {
    return `This action removes a #${id} brandproduct`;
  }
}
