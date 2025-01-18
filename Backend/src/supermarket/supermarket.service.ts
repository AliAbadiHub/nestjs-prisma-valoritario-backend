import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SupermarketService {
  constructor(private prisma: PrismaService) {}
  async createSupermarket(data: Prisma.SupermarketCreateInput) {
    try {
      const supermarket = await this.prisma.supermarket.create({
        data,
        include: {
          franchise: true,
          supermarketProducts: {
            include: {
              product: true,
              brandProduct: {
                include: {
                  brand: true,
                },
              },
            },
          },
        },
      });
      return supermarket;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'A supermarket with this name and address already exists',
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
          'Invalid data provided for supermarket creation',
        );
      }
      // For unexpected errors
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the supermarket',
      );
    }
  }

  async findAll(
    page: number,
    limit: number,
    filters: {
      name?: string;
      city?: string;
      franchiseId?: string;
      hasWebsite?: boolean;
      hasPhoneNumber?: boolean;
    },
  ) {
    try {
      const { name, city, franchiseId, hasWebsite, hasPhoneNumber } = filters;
      const skip = (page - 1) * limit;

      if (page < 1 || limit < 1) {
        throw new BadRequestException('Invalid page or limit value');
      }

      const whereClause: Prisma.SupermarketWhereInput = {};

      if (name) whereClause.name = { contains: name, mode: 'insensitive' };
      if (city) whereClause.city = { contains: city, mode: 'insensitive' };
      if (franchiseId) whereClause.franchiseId = franchiseId;
      if (hasWebsite !== undefined)
        whereClause.website = hasWebsite ? { not: null } : null;
      if (hasPhoneNumber !== undefined)
        whereClause.phoneNumber = hasPhoneNumber ? { not: null } : null;

      const [supermarkets, total] = await Promise.all([
        this.prisma.supermarket.findMany({
          where: whereClause,
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            franchiseId: true,
            openingHours: true,
            phoneNumber: true,
            address: true,
            city: true,
            website: true,
            latitude: true,
            longitude: true,
            createdAt: true,
            updatedAt: true,
            franchise: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        this.prisma.supermarket.count({ where: whereClause }),
      ]);

      if (supermarkets.length === 0 && total > 0) {
        throw new NotFoundException('No supermarkets found for the given page');
      }

      return { supermarkets, total, page, limit };
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
      console.error('Unexpected error in findAll:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching supermarkets',
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} supermarket`;
  }

  async getSupermarketById(id: string) {
    return this.prisma.supermarket.findUnique({
      where: { id },
      include: {
        franchise: true,
        supermarketProducts: true,
      },
    });
  }

  // remove(id: number) {
  //   return `This action removes a #${id} supermarket`;
  // }
}
