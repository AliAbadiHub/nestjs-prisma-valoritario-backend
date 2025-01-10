import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Product, ProductCategory } from '@prisma/client';
import { isUUID } from 'class-validator';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async createProduct(data: Prisma.ProductCreateInput) {
    try {
      const product = await this.prisma.product.create({
        data,
        include: {
          brandProducts: {
            include: {
              brand: true,
            },
          },
        },
      });
      return product;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'A product with this unique identifier already exists',
          );
        }
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Invalid reference to a related entity',
          );
        }
      }
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException(
          'Invalid data provided for product creation',
        );
      }
      // For unexpected errors
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the product',
      );
    }
  }

  async getProducts(
    page: number,
    limit: number,
    filters: {
      name?: string;
      category?: ProductCategory;
      isTypicallyBranded?: boolean;
      brandName?: string;
      unit?: string;
    },
  ) {
    try {
      const { name, category, isTypicallyBranded, brandName, unit } = filters;
      const skip = (page - 1) * limit;

      if (page < 1 || limit < 1) {
        throw new BadRequestException('Invalid page or limit value');
      }

      const whereClause: Prisma.ProductWhereInput = {};

      if (name) whereClause.name = { contains: name, mode: 'insensitive' };
      if (category) whereClause.category = category;
      if (isTypicallyBranded !== undefined)
        whereClause.isTypicallyBranded = isTypicallyBranded;
      if (unit) whereClause.units = { has: unit };

      if (brandName) {
        whereClause.brandProducts = {
          some: {
            brand: {
              name: { contains: brandName, mode: 'insensitive' },
            },
          },
        };
      }

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where: whereClause,
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            units: true,
            isTypicallyBranded: true,
            brandProducts: {
              select: {
                id: true,
                name: true,
                brand: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.product.count({ where: whereClause }),
      ]);

      if (products.length === 0 && total > 0) {
        throw new NotFoundException('No products found for the given page');
      }

      return { products, total, page, limit };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma errors
        if (error.code === 'P2023') {
          throw new BadRequestException('Invalid UUID format');
        }
      }
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException('Invalid data provided for query');
      }
      // Log the error for debugging
      console.error('Unexpected error in getProducts:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching products',
      );
    }
  }

  async getProductById(id: string) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          brandProducts: {
            include: {
              brand: true,
            },
          },
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma errors if needed
        throw new InternalServerErrorException(
          'An error occurred while fetching the product',
        );
      }
      // For unexpected errors
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async updateProduct(id: string, updateProductDto: Prisma.ProductUpdateInput) {
    try {
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
        include: {
          brandProducts: {
            include: {
              brand: true,
            },
          },
        },
      });
      return updatedProduct;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Product with ID ${id} not found`);
        }
      }
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<Product> {
    try {
      // Validate UUID format
      if (!isUUID(id)) {
        throw new BadRequestException('Invalid product ID format');
      }

      const deletedProduct = await this.prisma.product.delete({
        where: { id },
        include: {
          brandProducts: {
            include: {
              brand: true,
            },
          },
        },
      });

      return deletedProduct;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Product with ID ${id} not found`);
        }
        if (error.code === 'P2003') {
          throw new ConflictException(
            'Cannot delete product due to existing references',
          );
        }
      }
      // Log the error for debugging
      console.error('Unexpected error in deleteProduct service method:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the product',
      );
    }
  }
}
