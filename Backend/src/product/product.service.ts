import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  createProduct(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data });
  }

  getAllProducts() {
    return `This action returns all product`;
  }

  getProductById(id: number) {
    return `This action returns a #${id} product`;
  }

  getProductByName(id: number) {
    return `This action returns a #${id} product`;
  }

  updateProduct(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  deleteProduct(id: number) {
    return `This action removes a #${id} product`;
  }
}
