import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ContributionType } from '@prisma/client';
import { GetSupermarketProductDto } from './dto/get-supermarketproduct.dto';

@Injectable()
export class SupermarketProductService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new SupermarketProduct.
   * @param data - The data to create a SupermarketProduct.
   * @returns The created SupermarketProduct.
   * @throws NotFoundException if the Supermarket or BrandProduct does not exist.
   * @throws BadRequestException if an unexpected error occurs.
   */
  async createSupermarketProduct(data: Prisma.SupermarketProductCreateInput) {
    // Extract supermarketId and brandProductId from the connect objects
    const supermarketId = data.supermarket.connect?.id;
    const brandProductId = data.brandProduct.connect?.id;
    const unit = data.unit;

    if (!supermarketId || !brandProductId) {
      throw new BadRequestException(
        'Supermarket or BrandProduct ID is missing.',
      );
    }

    // Check if a SupermarketProduct with the same supermarketId, brandProductId, and unit already exists
    const existingEntry = await this.prisma.supermarketProduct.findFirst({
      where: {
        supermarketId,
        brandProductId,
        unit,
      },
    });

    if (existingEntry) {
      throw new ConflictException(
        'A SupermarketProduct with this combination (supermarket, brand product, and unit) already exists.',
      );
    }

    // Create the SupermarketProduct
    try {
      return await this.prisma.supermarketProduct.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'A SupermarketProduct with this combination already exists.',
          );
        }
        if (error.code === 'P2025') {
          throw new NotFoundException('Supermarket or BrandProduct not found.');
        }
      }
      throw new BadRequestException('An unexpected error occurred.');
    }
  }

  /**
   * Find a SupermarketProduct by Supermarket and BrandProduct.
   * @param supermarketId - The ID of the Supermarket.
   * @param brandProductId - The ID of the BrandProduct.
   * @returns The matching SupermarketProduct, or null if not found.
   */
  async findBySupermarketAndBrandProduct(
    supermarketId: string,
    brandProductId: string,
  ) {
    return this.prisma.supermarketProduct.findFirst({
      where: {
        supermarketId,
        brandProductId,
      },
    });
  }

  /**
   * Log a contribution for a SupermarketProduct.
   * @param supermarketProductId - The ID of the SupermarketProduct.
   * @param price - The new price.
   * @param type - The type of contribution (e.g., PRICE_UPDATE).
   * @param userId - The ID of the user making the contribution.
   * @returns The created ProductContribution.
   * @throws NotFoundException if the SupermarketProduct or User does not exist.
   * @throws BadRequestException if an unexpected error occurs.
   */
  async logContribution(
    supermarketProductId: string,
    price: number,
    type: ContributionType,
    userId: string,
  ) {
    try {
      return await this.prisma.productContribution.create({
        data: {
          supermarketProduct: { connect: { id: supermarketProductId } },
          user: { connect: { id: userId } },
          newValue: { price },
          type,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('SupermarketProduct or User not found.');
        }
      }
      throw new BadRequestException('An unexpected error occurred.');
    }
  }

  /**
   * Get a paginated list of SupermarketProducts with filters.
   * @param query - The query parameters for filtering and pagination.
   * @returns A paginated list of SupermarketProducts.
   * @throws BadRequestException if the query parameters are invalid.
   */
  async getSupermarketProducts(query: GetSupermarketProductDto) {
    const {
      city,
      supermarketIds,
      brandProductIds,
      brandIds,
      productName,
      brandName,
      minPrice,
      maxPrice,
      inStock,
      sortBy = 'price',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
    } = query;

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be greater than 0.');
    }

    // Build the Prisma query
    const where: Prisma.SupermarketProductWhereInput = {
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
      ...(productName && {
        brandProduct: {
          product: {
            name: {
              contains: productName,
              mode: 'insensitive', // Case-insensitive search
            },
          },
        },
      }),
      ...(brandName && {
        brandProduct: {
          brand: {
            name: {
              contains: brandName,
              mode: 'insensitive', // Case-insensitive search
            },
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

    const orderBy: Prisma.SupermarketProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    try {
      // Fetch paginated results
      const results = await this.prisma.supermarketProduct.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          supermarket: {
            select: {
              id: true,
              name: true,
              city: true,
              address: true,
              latitude: true,
              longitude: true,
            },
          },
          brandProduct: {
            include: {
              brand: {
                select: {
                  id: true,
                  name: true,
                  logo: true,
                },
              },
              product: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  category: true,
                  units: true,
                  isTypicallyBranded: true,
                },
              },
            },
          },
        },
      });

      // Simplify the response
      const simplifiedResults = results.map((result) => ({
        id: result.id,
        supermarketId: result.supermarketId,
        brandProductId: result.brandProductId,
        price: result.price,
        unit: result.unit,
        inStock: result.inStock,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        supermarket: result.supermarket,
        brandProduct: result.brandProduct,
      }));

      // Fetch total count for pagination metadata
      const total = await this.prisma.supermarketProduct.count({ where });

      return {
        data: simplifiedResults,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException('An unexpected error occurred.');
    }
  }
}
