import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
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

  // findAll() {
  //   return `This action returns all supermarket`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} supermarket`;
  // }

  // update(id: number, updateSupermarketDto: UpdateSupermarketDto) {
  //   return `This action updates a #${id} supermarket`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} supermarket`;
  // }
}
