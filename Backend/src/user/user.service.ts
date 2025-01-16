import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(email: string, password: string) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          // Other fields will use their default values as defined in the schema
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          role: true,
          // Exclude password and other sensitive fields
        },
      });

      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
      }
      throw error;
    }
  }

  async getUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const users = await this.prisma.user.findMany({
      skip,
      take: limit,
      select: { id: true, email: true, createdAt: true, role: true },
    });
    const total = await this.prisma.user.count();
    return { users, total, page, limit };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        role: true,
        _count: {
          select: {
            contributions: true,
            notifications: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        // Exclude password and other sensitive fields
      },
    });

    if (!user) {
      return null; // Let the controller handle the not found case
    }

    return user;
  }
  catch(error) {
    console.error('Service: Error in getUserByEmail:', error);
    throw error;
  }

  // async getUserContributions(userId: string, page: number, limit: number) {
  //   const skip = (page - 1) * limit;
  //   const contributions = await this.prisma.productContribution.findMany({
  //     where: { userId },
  //     skip,
  //     take: limit,
  //     orderBy: { createdAt: 'desc' },
  //     include: { supermarketProduct: true },
  //   });
  //   const total = await this.prisma.productContribution.count({ where: { userId } });
  //   return { contributions, total, page, limit };
  // }

  async updateUserPassword(id: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async deleteUser(id: string): Promise<Partial<User>> {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: { id },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return deletedUser;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`User with ID ${id} not found`);
        }
        if (error.code === 'P2003') {
          throw new ConflictException(
            'Cannot delete user due to existing references',
          );
        }
      }
      console.error('Unexpected error in deleteUser service method:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the user',
      );
    }
  }
}
