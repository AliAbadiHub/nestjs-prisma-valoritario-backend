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
import { PrismaService } from 'src/prisma/prisma.service';
import { GetSupermarketProductDto } from './dto/get-supermarketproduct.dto';
import { SupermarketProductService } from './supermarketproduct.service';

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
  @ApiOperation({ summary: 'Create a new SupermarketProduct' })
  @ApiBody({ type: CreateSupermarketProductDto })
  @ApiResponse({
    status: 201,
    description: 'SupermarketProduct created successfully.',
  })
  @ApiResponse({
    status: 409,
    description: 'A SupermarketProduct with this combination already exists.',
  })
  @UsePipes(ValidationPipe)
  async create(
    @Body() createSupermarketProductDto: CreateSupermarketProductDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;

    const { supermarketId, brandProductId, price, unit } =
      createSupermarketProductDto;

    // Fetch the brandProduct to ensure it exists
    const brandProduct = await this.prisma.brandProduct.findUnique({
      where: { id: brandProductId },
    });

    if (!brandProduct) {
      throw new NotFoundException(
        `BrandProduct with ID ${brandProductId} not found.`,
      );
    }

    // Create the SupermarketProduct
    const data: Prisma.SupermarketProductCreateInput = {
      supermarket: { connect: { id: supermarketId } },
      brandProduct: { connect: { id: brandProductId } },
      price,
      unit,
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
        if (error.code === 'P2002') {
          throw new ConflictException(
            'A SupermarketProduct with this combination already exists.',
          );
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
            brandProduct: {
              id: '8b2d3c4d-5678-90ef-ab12-34567890cdef',
              brand: {
                id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                name: 'Nestle',
                logo: null,
              },
              product: {
                id: '55555555-5555-5555-5555-555555555555',
                name: 'Tomatoes',
                description: 'Fresh tomatoes',
                category: 'PRODUCE',
                units: ['kg'],
                isTypicallyBranded: false,
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
