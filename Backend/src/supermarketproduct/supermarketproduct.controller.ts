import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiSecurity,
  ApiQuery,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/roles.decorators';
import { Role } from '@prisma/client';
import { Request as ExpressRequest } from 'express';
import { SupermarketProductService } from './supermarketproduct.service';
import { CreateSupermarketProductDto } from './dto/create-supermarketproduct.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetSupermarketProductDto } from './dto/get-supermarketproduct.dto';

// Define an interface for req.user to avoid TypeScript errors
interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: string; // User ID from the JWT token
    email: string; // Optional, in case email is needed
    role: Role; // User role
  };
}

@ApiTags('Supermarket Products')
@ApiBearerAuth()
@Controller('supermarket-products')
export class SupermarketProductController {
  constructor(
    private readonly supermarketProductService: SupermarketProductService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.MERCHANT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiOperation({ summary: 'Create a new Supermarket Product' })
  @ApiBody({
    type: CreateSupermarketProductDto,
    description: 'Data to create a Supermarket Product entry.',
    examples: {
      validInput: {
        summary: 'Valid Input Example',
        value: {
          supermarketId: 'f1940f34-ff22-4117-9e0d-8653ed2f0bcf',
          brandProductId: '5f6bda38-88c1-42c2-9a17-4fd6d9c14dc9',
          unit: '500ml',
          price: 1.99,
          inStock: true,
        },
      },
      withoutInStock: {
        summary: 'Default "inStock" Example',
        value: {
          supermarketId: 'f1940f34-ff22-4117-9e0d-8653ed2f0bcf',
          brandProductId: '5f6bda38-88c1-42c2-9a17-4fd6d9c14dc9',
          unit: '1L',
          price: 2.49,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The Supermarket Product was successfully created.',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        supermarketId: 'f1940f34-ff22-4117-9e0d-8653ed2f0bcf',
        brandProductId: '5f6bda38-88c1-42c2-9a17-4fd6d9c14dc9',
        unit: '500ml',
        price: 1.99,
        inStock: true,
        createdBy: 'c8b171a3-4f33-43b5-a376-8c404f4a6654',
        createdAt: '2025-01-26T14:30:00Z',
        updatedAt: '2025-01-26T14:30:00Z',
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
          'supermarketId must be a valid UUID',
          'price must be a positive number',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT.',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions.',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - A product with the same supermarket, brand product, and unit already exists.',
    schema: {
      example: {
        statusCode: 409,
        message:
          'A product with the same supermarket, brand product, and unit already exists.',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Unexpected error.',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal Server Error. Unable to create Supermarket Product.',
        error: 'Internal Server Error',
      },
    },
  })
  async create(
    @Body() createSupermarketProductDto: CreateSupermarketProductDto,
    @Req() req: AuthenticatedRequest, // Use the extended type
  ) {
    try {
      const userId = req.user.id; // Extract the userId from the validated JWT

      // Create the Supermarket Product
      const supermarketProduct =
        await this.supermarketProductService.createSupermarketProduct({
          ...createSupermarketProductDto,
          userId, // Pass the userId to the service
        });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Supermarket Product created successfully.',
        data: supermarketProduct,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        // Prisma unique constraint error
        throw new HttpException(
          'A product with the same supermarket, brand product, and unit already exists.',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        'Internal Server Error. Unable to create Supermarket Product.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @Roles(Role.ADMIN, Role.MERCHANT, Role.VERIFIED)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiSecurity('verified')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get Supermarket Products with filtering options' })
  @ApiResponse({
    status: 200,
    description:
      'Filtered list of supermarket products sorted by price in ascending order.',
    schema: {
      example: {
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            supermarket: {
              id: 'f1940f34-ff22-4117-9e0d-8653ed2f0bcf',
              name: 'Mas por Menos',
              city: 'Caracas',
            },
            brandProduct: {
              id: '5f6bda38-88c1-42c2-9a17-4fd6d9c14dc9',
              brand: {
                id: 'abc12345-6789-12d3-a456-426614174000',
                name: 'Mavesa',
              },
              product: {
                id: 'cba98765-4321-12d3-a456-426614174000',
                name: 'Corn Oil',
              },
            },
            unit: '500ml',
            price: 1.99,
            inStock: true,
            createdAt: '2025-01-26T14:30:00Z',
            updatedAt: '2025-01-26T14:30:00Z',
          },
        ],
        meta: {
          totalItems: 100,
          totalPages: 10,
          currentPage: 1,
          itemsPerPage: 10,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid or missing query parameters.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have the required role.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Unexpected error.',
  })
  @ApiQuery({
    name: 'city',
    required: true,
    type: String,
    description: 'Filter products by supermarkets in the specified city.',
    example: 'Caracas',
  })
  @ApiQuery({
    name: 'supermarketName',
    required: false,
    type: String,
    description: 'Filter products by partial supermarket name.',
    example: 'Mas por Menos',
  })
  @ApiQuery({
    name: 'productName',
    required: false,
    type: String,
    description: 'Filter products by partial product name.',
    example: 'Corn Oil',
  })
  @ApiQuery({
    name: 'brandName',
    required: false,
    type: String,
    description: 'Filter products by partial brand name.',
    example: 'Mavesa',
  })
  @ApiQuery({
    name: 'unit',
    required: false,
    type: String,
    description: 'Filter products by exact container size (e.g., "500ml").',
    example: '500ml',
  })
  @ApiQuery({
    name: 'inStock',
    required: false,
    type: Boolean,
    description: 'Filter products by availability (true or false).',
    example: true,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (default: 1).',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10).',
    example: 10,
  })
  async getSupermarketProducts(@Query() query: GetSupermarketProductDto) {
    const { data, meta } =
      await this.supermarketProductService.getSupermarketProducts(query);

    return {
      data, // Array of results
      meta, // Pagination metadata
    };
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MERCHANT)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get a Supermarket Product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the Supermarket Product with the specified ID.',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        supermarket: {
          id: 'f1940f34-ff22-4117-9e0d-8653ed2f0bcf',
          name: 'Mas por Menos',
          city: 'Caracas',
        },
        brandProduct: {
          id: '5f6bda38-88c1-42c2-9a17-4fd6d9c14dc9',
          brand: {
            id: 'abc12345-6789-12d3-a456-426614174000',
            name: 'Mavesa',
          },
          product: {
            id: 'cba98765-4321-12d3-a456-426614174000',
            name: 'Corn Oil',
          },
        },
        unit: '500ml',
        price: 1.99,
        inStock: true,
        createdAt: '2025-01-26T14:30:00Z',
        updatedAt: '2025-01-26T14:30:00Z',
        contributions: [
          {
            id: '6789abcd-ef01-2345-6789-0123456789ab',
            userId: 'user12345-6789-12d3-a456-426614174000',
            type: 'PRICE_UPDATE',
            oldValue: { price: 1.89 },
            newValue: { price: 1.99 },
            createdAt: '2025-01-27T10:15:00Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid or missing ID.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have the required role.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Not Found - Supermarket Product with the specified ID was not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Unexpected error.',
  })
  async getSupermarketProductById(@Param('id') id: string) {
    if (!id) {
      throw new HttpException('ID is required.', HttpStatus.BAD_REQUEST);
    }

    const supermarketProduct =
      await this.supermarketProductService.getSupermarketProductById(id);

    if (!supermarketProduct) {
      throw new HttpException(
        'Supermarket Product not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    return supermarketProduct;
  }
}
