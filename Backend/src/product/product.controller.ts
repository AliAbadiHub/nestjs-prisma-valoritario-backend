import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  // Param,
  // Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Query,
  NotFoundException,
  Param,
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
} from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorators';
import { ProductCategory, Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
// import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiTags('Products')
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
  @ApiTags('Products')
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
    example: 'milk',
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
    example: 'nestle',
  })
  @ApiQuery({
    name: 'unit',
    required: false,
    type: String,
    description: 'Filter products by unit of measurement',
    example: 'liter',
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved products' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('name') name?: string,
    @Query('category') category?: ProductCategory,
    @Query('isTypicallyBranded') isTypicallyBranded?: boolean,
    @Query('brandName') brandName?: string,
    @Query('unit') unit?: string,
  ) {
    return this.productService.getProducts(page, limit, {
      name,
      category,
      isTypicallyBranded,
      brandName,
      unit,
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MERCHANT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get a specific product by ID' })
  @ApiParam({ name: 'id', required: true, description: 'UUID of the product' })
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

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
  //   return this.productService.update(+id, updateProductDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.productService.remove(+id);
  // }
}
