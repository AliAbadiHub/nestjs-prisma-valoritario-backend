import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
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
      select: { id: true, email: true, createdAt: true, role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUserByEmail(email: string) {
    console.log('Service: Searching for user with email:', email);
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

    console.log('Service: Found user:', user);

    if (!user) {
      console.log('Service: User not found');
      return null; // Let the controller handle the not found case
    }

    console.log('Service: User found:', user);
    return user;
  }
  catch(error) {
    console.error('Service: Error in getUserByEmail:', error);
    throw error;
  }

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

  async deleteUser(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        // P2025 is Prisma's error code for record not found
        return false;
      }
      throw error;
    }
  }
}
