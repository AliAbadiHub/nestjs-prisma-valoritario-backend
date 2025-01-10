import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BrandService {
  constructor(private prisma: PrismaService) {}

  async createBrand(data: Prisma.BrandCreateInput) {
    try {
      const brand = await this.prisma.brand.create({
        data,
        include: {
          brandProducts: {
            include: {
              product: true,
            },
          },
        },
      });
      return brand;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'A brand with this unique identifier already exists',
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
          'Invalid data provided for brand creation',
        );
      }
      // For unexpected errors
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the brand',
      );
    }
  }

  async getBrands({
    name,
    productId,
    productName,
    limit,
    offset,
  }: {
    name?: string;
    productId?: string;
    productName?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.BrandWhereInput = {};

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    if (productId || productName) {
      where.brandProducts = {
        some: {
          ...(productId && { productId }),
          ...(productName && {
            product: { name: { contains: productName, mode: 'insensitive' } },
          }),
        },
      };
    }

    const brands = await this.prisma.brand.findMany({
      where,
      include: {
        brandProducts: {
          include: {
            product: true,
          },
        },
      },
      take: limit,
      skip: offset,
    });

    const total = await this.prisma.brand.count({ where });

    return { brands, total };
  }

  async getBrandProducts(brandId: string) {
    return this.prisma.brandProduct.findMany({
      where: { brandId },
      include: { product: true },
    });
  }

  async getBrandById(id: string) {
    return this.prisma.brand.findUnique({
      where: { id },
      include: {
        brandProducts: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  // update(id: number, data: Prisma.BrandUpdateInput) {
  //   return `This action updates a #${id} brand`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} brand`;
  // }
}
