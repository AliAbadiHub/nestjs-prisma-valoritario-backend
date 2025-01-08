import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, ProductCategory } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  createProduct(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data });
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
    const { name, category, isTypicallyBranded, brandName, unit } = filters;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

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

    const products = await this.prisma.product.findMany({
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
    });

    const total = await this.prisma.product.count({ where: whereClause });

    return { products, total, page, limit };
  }

  async getProductById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        brandProducts: {
          include: {
            brand: true,
          },
        },
      },
    });
  }

  // getProductByName(id: number) {
  //   return `This action returns a #${id} product`;
  // }

  // updateProduct(id: number, updateProductDto: UpdateProductDto) {
  //   return `This action updates a #${id} product`;
  // }

  // deleteProduct(id: number) {
  //   return `This action removes a #${id} product`;
  // }
}
