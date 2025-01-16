import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Brand, Prisma } from '@prisma/client';
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

  async updateBrand(id: string, updateBrandDto: Prisma.BrandUpdateInput) {
    try {
      const updatedBrand = await this.prisma.brand.update({
        where: { id },
        data: updateBrandDto,
        include: {
          brandProducts: {
            include: {
              product: true,
            },
          },
        },
      });
      return updatedBrand;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Brand with ID ${id} not found`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Brand name must be unique');
        }
      }
      throw error;
    }
  }

  async deleteBrand(id: string): Promise<Brand> {
    try {
      const deletedBrand = await this.prisma.brand.delete({
        where: { id },
      });
      return deletedBrand;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Brand with ID ${id} not found`);
        }
      }
      throw error;
    }
  }
}
