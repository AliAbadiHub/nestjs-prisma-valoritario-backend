import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UseGuards,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiSecurity,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { CreateSupermarketProductDto } from './dto/create-supermarketproduct.dto';
import { SupermarketProductService } from './supermarketproduct.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetSupermarketProductDto } from './dto/get-supermarketproduct.dto';

@Controller('supermarketproduct')
@ApiTags('supermarketproducts')
@ApiBearerAuth()
export class SupermarketProductController {
  constructor(
    private readonly supermarketProductService: SupermarketProductService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.MERCHANT, Role.VERIFIED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiSecurity('verified')
  @ApiOperation({ summary: 'Create a new SupermarketProduct' })
  @ApiBody({
    type: CreateSupermarketProductDto,
    description: 'Data required to create a new SupermarketProduct',
    examples: {
      brandedProduct: {
        summary: 'Branded Product in Supermarket',
        value: {
          supermarketId: '2e7cba03-786f-4c2a-884f-1aa3ca717b65',
          brandProductId: '8b2d3c4d-5678-90ef-ab12-34567890cdef',
          price: 5.99,
          unit: 'kg', // Optional field
        },
      },
      unbrandedProduct: {
        summary: 'Unbranded Product in Supermarket',
        value: {
          supermarketId: '2e7cba03-786f-4c2a-884f-1aa3ca717b65',
          brandProductId: '8b2d3c4d-5678-90ef-ab12-34567890cdef',
          price: 3.49,
          // unit is omitted, as it can be inferred from the product
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The SupermarketProduct has been successfully created.',
    schema: {
      example: {
        id: '7b2d3c4d-5678-90ef-ab12-34567890aaaa',
        supermarketId: '2e7cba03-786f-4c2a-884f-1aa3ca717b65',
        productId: '9d4cc102-7bc8-4d60-a539-0dc98ca9323b', // Inferred from brandProductId
        brandProductId: '8b2d3c4d-5678-90ef-ab12-34567890cdef',
        price: 5.99,
        unit: 'kg', // Inferred from the product if not provided
        inStock: true, // Defaults to true
        createdAt: '2025-01-20T12:00:00.000Z',
        updatedAt: '2025-01-20T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data.',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'supermarketId must be a UUID',
          'price must be a positive number',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Supermarket or BrandProduct not found.',
    schema: {
      example: {
        statusCode: 404,
        message:
          'BrandProduct with ID 8b2d3c4d-5678-90ef-ab12-34567890cdef not found.',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - A SupermarketProduct with this combination already exists.',
    schema: {
      example: {
        statusCode: 409,
        message: 'A SupermarketProduct with this combination already exists.',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - An unexpected error occurred.',
    schema: {
      example: {
        statusCode: 500,
        message: 'An unexpected error occurred.',
        error: 'Internal Server Error',
      },
    },
  })
  @UsePipes(ValidationPipe)
  async create(
    @Body() createSupermarketProductDto: CreateSupermarketProductDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;

    const { supermarketId, brandProductId, price, unit } =
      createSupermarketProductDto;

    // Fetch the brandProduct to get the productId
    const brandProduct = await this.prisma.brandProduct.findUnique({
      where: { id: brandProductId },
      select: { productId: true },
    });

    if (!brandProduct) {
      throw new NotFoundException(
        `BrandProduct with ID ${brandProductId} not found.`,
      );
    }

    const productId = brandProduct.productId;

    // Check if the combination already exists
    const existingEntry =
      await this.supermarketProductService.findBySupermarketAndProduct(
        supermarketId,
        productId,
        brandProductId,
      );
    if (existingEntry) {
      throw new ConflictException(
        'A SupermarketProduct with this combination already exists.',
      );
    }

    // Create the SupermarketProduct
    const data: Prisma.SupermarketProductCreateInput = {
      supermarket: { connect: { id: supermarketId } },
      product: { connect: { id: productId } },
      brandProduct: { connect: { id: brandProductId } },
      price,
      ...(unit && { unit }), // Use the provided unit or default to the product's unit
      inStock: true, // Default to true
    };

    try {
      const supermarketProduct =
        await this.supermarketProductService.createSupermarketProduct(data);

      // Log the contribution if this is a new entry
      await this.supermarketProductService.logContribution(
        supermarketProduct.id,
        price,
        'PRICE_UPDATE',
        userId,
      );

      return supermarketProduct;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Supermarket or BrandProduct not found.');
        }
      }
      throw new BadRequestException('An unexpected error occurred.');
    }
  }

  @Get()
  @Roles(Role.ADMIN, Role.MERCHANT, Role.VERIFIED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiSecurity('verified')
  @UsePipes(new ValidationPipe({ transform: true })) // Enable validation and transformation
  @ApiOperation({ summary: 'Search for supermarket products' })
  @ApiQuery({
    name: 'city',
    required: false,
    type: String,
    description: 'Filter by supermarkets in a specific city.',
    example: 'Caracas',
  })
  @ApiQuery({
    name: 'supermarketIds',
    required: false,
    type: String,
    description: 'Filter by specific supermarket IDs (comma-separated).',
    example:
      '2e7cba03-786f-4c2a-884f-1aa3ca717b65,88888888-8888-8888-8888-888888888888',
  })
  @ApiQuery({
    name: 'productIds',
    required: false,
    type: String,
    description: 'Filter by specific product IDs (comma-separated).',
    example:
      '55555555-5555-5555-5555-555555555555,66666666-6666-6666-6666-666666666666',
  })
  @ApiQuery({
    name: 'brandProductIds',
    required: false,
    type: String,
    description: 'Filter by specific brand product IDs (comma-separated).',
    example:
      '8b2d3c4d-5678-90ef-ab12-34567890cdef,22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  })
  @ApiQuery({
    name: 'brandIds',
    required: false,
    type: String,
    description: 'Filter by specific brand IDs (comma-separated).',
    example:
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb,cccccccc-cccc-cccc-cccc-cccccccccccc',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description:
      'Filter by products with a price greater than or equal to this value.',
    example: 1.0,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description:
      'Filter by products with a price less than or equal to this value.',
    example: 10.0,
  })
  @ApiQuery({
    name: 'inStock',
    required: false,
    type: Boolean,
    description:
      'Filter by products that are in stock (`true`) or out of stock (`false`).',
    example: true,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Field to sort by (e.g., `price`).',
    example: 'price',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    description: 'Sort order (`asc` or `desc`).',
    example: 'asc',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (default: `1`).',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page for pagination (default: `10`).',
    example: 10,
  })
  @ApiOkResponse({
    description: 'Successfully retrieved supermarket products.',
    schema: {
      example: {
        data: [
          {
            id: '7b2d3c4d-5678-90ef-ab12-34567890aaaa',
            supermarketId: '2e7cba03-786f-4c2a-884f-1aa3ca717b65',
            productId: '55555555-5555-5555-5555-555555555555',
            brandProductId: '8b2d3c4d-5678-90ef-ab12-34567890cdef',
            price: 5.99,
            unit: 'kg',
            inStock: true,
            createdAt: '2025-01-20T12:00:00.000Z',
            updatedAt: '2025-01-20T12:00:00.000Z',
            supermarket: {
              id: '2e7cba03-786f-4c2a-884f-1aa3ca717b65',
              name: 'Mas por Menos - Main Branch',
              city: 'Caracas',
              address: '123 Main Street, Caracas',
              latitude: 10.5,
              longitude: -66.9167,
            },
            product: {
              id: '55555555-5555-5555-5555-555555555555',
              name: 'Tomatoes',
              description: 'Fresh tomatoes',
              category: 'PRODUCE',
              units: ['kg'],
              isTypicallyBranded: false,
            },
            brandProduct: {
              id: '8b2d3c4d-5678-90ef-ab12-34567890cdef',
              brandId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
              brand: {
                id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                name: 'Nestle',
                logo: null,
              },
            },
          },
        ],
        meta: {
          total: 100,
          page: 1,
          limit: 10,
          totalPages: 10,
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - Invalid query parameters.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Page and limit must be greater than 0.',
        error: 'Bad Request',
      },
    },
  })
  async getSupermarketProducts(@Query() query: GetSupermarketProductDto) {
    try {
      const { page = 1, limit = 10, ...filters } = query;

      // Validate pagination parameters
      if (page < 1 || limit < 1) {
        throw new BadRequestException('Page and limit must be greater than 0.');
      }

      // Call the service to fetch filtered and paginated results
      return this.supermarketProductService.getSupermarketProducts({
        ...filters,
        page,
        limit,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
