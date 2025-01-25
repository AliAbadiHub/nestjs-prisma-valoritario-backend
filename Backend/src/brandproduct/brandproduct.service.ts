import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateBrandproductDto } from './dto/update-brandproduct.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBrandProductDto } from './dto/create-brandproduct.dto';

@Injectable()
export class BrandProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createBrandProduct(data: CreateBrandProductDto) {
    const { brandId, productId, name } = data;

    // Use the hardcoded unbranded UUID if brandId is not provided
    const unbrandedId = '00000000-0000-0000-0000-UNBRANDED00';
    const brandToUse = brandId || unbrandedId;

    // Check if the product exists
    const productExists = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!productExists) {
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }

    // Check if the brand exists (either provided brandId or unbrandedId)
    const brandExists = await this.prisma.brand.findUnique({
      where: { id: brandToUse },
    });
    if (!brandExists) {
      throw new NotFoundException(`Brand with ID ${brandToUse} not found.`);
    }

    // Create the BrandProduct entry
    try {
      return await this.prisma.brandProduct.create({
        data: {
          brandId: brandToUse,
          productId,
          name,
        },
      });
    } catch (error) {
      // Handle unique constraint violations (e.g., duplicate entries)
      if (error.code === 'P2002') {
        throw new ConflictException(
          `A BrandProduct with this brand and product combination already exists.`,
        );
      }
      // Catch any other unexpected errors
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the BrandProduct.',
      );
    }
  }

  findAll() {
    return `This action returns all brandproduct`;
  }

  findOne(id: number) {
    return `This action returns a #${id} brandproduct`;
  }

  update(id: number, updateBrandproductDto: UpdateBrandproductDto) {
    return `This action updates a #${id} brandproduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} brandproduct`;
  }
}
