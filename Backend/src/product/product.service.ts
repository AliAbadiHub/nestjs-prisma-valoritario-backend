import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  createProduct(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data });
  }

  async getProducts(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const products = await this.prisma.product.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        units: true,
        isTypicallyBranded: true,
      },
    });
    const total = await this.prisma.product.count();
    return { products, total, page, limit };
  }

  // getProductById(id: number) {
  //   return `This action returns a #${id} product`;
  // }

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
