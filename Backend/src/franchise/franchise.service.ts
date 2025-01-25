import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateFranchiseDto } from './dto/create-franchise.dto';
import { UpdateFranchiseDto } from './dto/update-franchise.dto';

@Injectable()
export class FranchiseService {
  constructor(private readonly prisma: PrismaService) {}

  async createFranchise(data: CreateFranchiseDto) {
    try {
      return this.prisma.franchise.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Unique constraint violation
          throw new ConflictException(
            'A franchise with that name already exists.',
          );
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the franchise.',
      );
    }
  }

  async getFranchises(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;
      const franchises = await this.prisma.franchise.findMany({
        skip,
        take: limit,
      });
      const total = await this.prisma.franchise.count();
      return { franchises, total, page, limit };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while retrieving franchises.',
      );
    }
  }

  async getFranchiseById(id: string) {
    const franchise = await this.prisma.franchise.findUnique({ where: { id } });
    if (!franchise) {
      throw new NotFoundException(`Franchise with ID ${id} not found.`);
    }
    return franchise;
  }

  async updateFranchise(id: string, data: UpdateFranchiseDto) {
    try {
      return this.prisma.franchise.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Franchise with ID ${id} not found.`);
        }
      }
      throw new InternalServerErrorException(
        'An error occurred while updating the franchise.',
      );
    }
  }

  async deleteFranchise(id: string) {
    try {
      return this.prisma.franchise.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Franchise with ID ${id} not found.`);
        }
      }
      throw new InternalServerErrorException(
        'An error occurred while deleting the franchise.',
      );
    }
  }
}
