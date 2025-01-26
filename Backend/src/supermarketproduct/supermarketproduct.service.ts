import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ContributionType } from '@prisma/client'; // Import ContributionType
import { GetSupermarketProductDto } from './dto/get-supermarketproduct.dto';

@Injectable()
export class SupermarketProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createSupermarketProduct(data: Prisma.SupermarketProductCreateInput) {
    return this.prisma.supermarketProduct.create({ data });
  }

  async findBySupermarketAndProduct(
    supermarketId: string,
    productId: string,
    brandProductId?: string,
  ) {
    return this.prisma.supermarketProduct.findFirst({
      where: {
        supermarketId,
        productId,
        brandProductId: brandProductId || null,
      },
    });
  }

  async logContribution(
    supermarketProductId: string,
    price: number,
    type: ContributionType, // Use the enum here
    userId: string, // Add userId as a parameter
  ) {
    return this.prisma.productContribution.create({
      data: {
        supermarketProduct: { connect: { id: supermarketProductId } },
        user: { connect: { id: userId } }, // Connect the user
        newValue: { price },
        type,
      },
    });
  }

  async getSupermarketProducts(query: GetSupermarketProductDto) {
    const {
      city,
      supermarketIds,
      productIds,
      brandProductIds,
      brandIds,
      minPrice,
      maxPrice,
      inStock,
      sortBy = 'price',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
    } = query;

    // Build the Prisma query
    const where = {
      ...(city && {
        supermarket: {
          city,
        },
      }),
      ...(supermarketIds && {
        supermarketId: {
          in: supermarketIds,
        },
      }),
      ...(productIds && {
        productId: {
          in: productIds,
        },
      }),
      ...(brandProductIds && {
        brandProductId: {
          in: brandProductIds,
        },
      }),
      ...(brandIds && {
        brandProduct: {
          brandId: {
            in: brandIds,
          },
        },
      }),
      ...(minPrice !== undefined && {
        price: {
          gte: minPrice,
        },
      }),
      ...(maxPrice !== undefined && {
        price: {
          lte: maxPrice,
        },
      }),
      ...(inStock !== undefined && {
        inStock,
      }),
    };

    const orderBy = {
      [sortBy]: sortOrder,
    };

    // Fetch paginated results
    const results = await this.prisma.supermarketProduct.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        supermarket: true,
        product: true,
        brandProduct: {
          include: {
            brand: true,
          },
        },
      },
    });

    // Fetch total count for pagination metadata
    const total = await this.prisma.supermarketProduct.count({ where });

    return {
      data: results,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
