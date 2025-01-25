import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BrandProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createBrandProduct(data: Prisma.BrandProductCreateInput) {
    const { brand, product } = data;
    const brandId = brand.connect.id;
    const productId = product.connect.id;

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

      if (!brandProduct) {
        throw new NotFoundException(`BrandProduct with ID ${id} not found.`);
      }

      return brandProduct;
    } catch (error) {
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving the BrandProduct.',
      );
    }
  }

  async updateBrandProduct(
    id: string,
    data: Prisma.BrandProductUpdateInput, // Directly using Prisma's type
  ) {
    try {
      // Check if the BrandProduct exists
      const existingBrandProduct = await this.prisma.brandProduct.findUnique({
        where: { id },
      });

      if (!existingBrandProduct) {
        throw new NotFoundException(`BrandProduct with ID ${id} not found.`);
      }

      // Check for conflicts (duplicate brandId + productId combination)
      const { brand, product } = data;
      const brandId = brand.connect.id;
      const productId = product.connect.id;
      if (brandId && productId) {
        const conflict = await this.prisma.brandProduct.findFirst({
          where: {
            brandId: brandId as string,
            productId: productId as string,
            NOT: { id }, // Exclude the current entry
          },
        });

        if (conflict) {
          throw new ConflictException(
            'A BrandProduct with this combination already exists.',
          );
        }
      }

      // Perform the update
      const updatedBrandProduct = await this.prisma.brandProduct.update({
        where: { id },
        data,
      });

      return updatedBrandProduct;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      console.error('Unexpected error in updateBrandProduct:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the BrandProduct.',
      );
    }
  }

  async deleteBrandProduct(id: string) {
    try {
      // Check if the BrandProduct exists
      const existingBrandProduct = await this.prisma.brandProduct.findUnique({
        where: { id },
      });

      if (!existingBrandProduct) {
        throw new NotFoundException(`BrandProduct with ID ${id} not found.`);
      }

      // Perform the deletion
      const deletedBrandProduct = await this.prisma.brandProduct.delete({
        where: { id },
      });

      return {
        message: 'BrandProduct successfully deleted.',
        deletedBrandProduct,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Unexpected error in deleteBrandProduct:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the BrandProduct.',
      );
    }
  }
}
