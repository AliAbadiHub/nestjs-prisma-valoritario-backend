import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Query,
  NotFoundException,
  Param,
  BadRequestException,
  Delete,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiSecurity,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorators';
import { Product, ProductCategory, Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
@ApiTags('products')
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MERCHANT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({
    type: CreateProductDto,
    description: 'Product data to create',
    examples: {
      validProduct: {
        summary: 'Valid Product',
        value: {
          name: 'Organic Whole Milk',
          description: 'Fresh organic whole milk from local farms',
          category: ProductCategory.DAIRY,
          units: ['liter', 'gallon'],
          isTypicallyBranded: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created.',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Organic Whole Milk',
        description: 'Fresh organic whole milk from local farms',
        category: ProductCategory.DAIRY,
        units: ['liter', 'gallon'],
        isTypicallyBranded: true,
        createdAt: '2023-04-20T14:30:00Z',
        updatedAt: '2023-04-20T14:30:00Z',
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
          'name must be a string',
          'category must be a valid enum value',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - A product with that name already exists.',
    schema: {
      example: {
        statusCode: 409,
        message: 'A product with the name "Organic Whole Milk" already exists',
        error: 'Conflict',
      },
    },
  })
  @UsePipes(ValidationPipe)
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MERCHANT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get all products with filtering options' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter products by name (case-insensitive, partial match)',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: ProductCategory,
    description: 'Filter products by category',
  })
  @ApiQuery({
    name: 'isTypicallyBranded',
    required: false,
    type: Boolean,
    description: 'Filter products by whether they are typically branded',
  })
  @ApiQuery({
    name: 'brandName',
    required: false,
    type: String,
    description:
      'Filter products by brand name (case-insensitive, partial match)',
  })
  @ApiQuery({
    name: 'unit',
    required: false,
    type: String,
    description: 'Filter products by unit of measurement',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved products' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
    @Query('category') category?: ProductCategory,
    @Query('isTypicallyBranded') isTypicallyBranded?: string,
    @Query('brandName') brandName?: string,
    @Query('unit') unit?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    const parsedIsTypicallyBranded = isTypicallyBranded
      ? isTypicallyBranded.toLowerCase() === 'true'
      : undefined;

    return this.productService.getProducts(parsedPage, parsedLimit, {
      name,
      category,
      isTypicallyBranded: parsedIsTypicallyBranded,
      brandName,
      unit,
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MERCHANT, Role.VERIFIED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiSecurity('verified')
  @ApiOperation({ summary: 'Get a specific product by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the product',
    example: '9d4cc102-7bc8-4d60-a539-0dc98ca9323b',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the product',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  async findOne(@Param('id') id: string) {
    const product = await this.productService.getProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MERCHANT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiOperation({ summary: 'Update a specific product by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the product',
    example: '9d4cc102-7bc8-4d60-a539-0dc98ca9323b',
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the product',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const updatedProduct = await this.productService.updateProduct(
      id,
      updateProductDto,
    );
    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }
    return updatedProduct;
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiOperation({ summary: 'Delete a specific product by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the product to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Product successfully deleted',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        deletedProduct: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            category: {
              type: 'string',
              enum: ['PRODUCE', 'DAIRY', 'BUTCHER', 'GROCERY'],
            },
            units: { type: 'array', items: { type: 'string' } },
            isTypicallyBranded: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            brandProducts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  brand: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid ID format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Cannot delete due to existing references',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteProduct(
    @Param('id') id: string,
  ): Promise<{ message: string; deletedProduct: Product }> {
    try {
      const deletedProduct = await this.productService.deleteProduct(id);
      return {
        message: 'Product successfully deleted',
        deletedProduct,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Unexpected error in deleteProduct:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the product',
      );
    }
  }
}
