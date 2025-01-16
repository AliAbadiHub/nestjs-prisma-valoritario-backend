import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
  Param,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Brand, Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/roles.decorators';

@Controller('brand')
@ApiTags('brands')
@ApiBearerAuth()
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MERCHANT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiBody({
    type: CreateBrandDto,
    description: 'Brand data to create',
    examples: {
      validBrand: {
        summary: 'Valid Brand',
        value: {
          name: 'Nestle',
          logo: 'https://example.com/nestle-logo.png',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The brand has been successfully created.',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Nestle',
        logo: 'https://example.com/nestle-logo.png',
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
        message: ['name must be a string', 'logo must be a valid URL'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - A brand with that name already exists.',
    schema: {
      example: {
        statusCode: 409,
        message: 'A brand with the name "Nestle" already exists',
        error: 'Conflict',
      },
    },
  })
  @UsePipes(ValidationPipe)
  async createBrand(@Body() createBrandDto: CreateBrandDto) {
    return this.brandService.createBrand(createBrandDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MERCHANT, Role.VERIFIED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiSecurity('verified')
  @ApiOperation({
    summary: 'Get brands with optional filtering and pagination',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter brands by name (case-insensitive, partial match)',
  })
  @ApiQuery({
    name: 'productId',
    required: false,
    type: String,
    description: 'Filter brands by product ID',
  })
  @ApiQuery({
    name: 'productName',
    required: false,
    type: String,
    description:
      'Filter brands by product name (case-insensitive, partial match)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of items to skip for pagination',
    example: 0,
  })
  @ApiResponse({ status: 200, description: 'Successfully retrieved brands' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  async getBrands(
    @Query('name') name?: string,
    @Query('productId') productId?: string,
    @Query('productName') productName?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;

    return this.brandService.getBrands({
      name,
      productId,
      productName,
      limit: parsedLimit,
      offset: parsedOffset,
    });
  }

  @Get(':id/products')
  @Roles(Role.ADMIN, Role.MERCHANT, Role.VERIFIED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiSecurity('verified')
  @ApiOperation({ summary: 'Get products offered by a specific brand' })
  @ApiParam({ name: 'id', description: 'Brand ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved products for the brand',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          productId: { type: 'string' },
          // Add other relevant properties
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async getBrandProducts(@Param('id', new ParseUUIDPipe()) id: string) {
    const products = await this.brandService.getBrandProducts(id);
    if (!products.length) {
      throw new NotFoundException(`No products found for brand with id ${id}`);
    }
    return products;
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MERCHANT, Role.VERIFIED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiSecurity('verified')
  @ApiOperation({ summary: 'Get a specific brand by ID' })
  @ApiParam({
    name: 'id',
    description: 'Brand ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the brand',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        logo: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        brandProducts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              productId: { type: 'string', format: 'uuid' },
              // Add other relevant properties
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async getBrandById(@Param('id', new ParseUUIDPipe()) id: string) {
    const brand = await this.brandService.getBrandById(id);
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return brand;
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MERCHANT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiOperation({ summary: 'Update a specific brand by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the brand',
    example: '9d4cc102-7bc8-4d60-a539-0dc98ca9323b',
  })
  @ApiBody({ type: UpdateBrandDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the brand',
  })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    const updatedBrand = await this.brandService.updateBrand(
      id,
      updateBrandDto,
    );
    if (!updatedBrand) {
      throw new NotFoundException('Brand not found');
    }
    return updatedBrand;
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MERCHANT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiOperation({ summary: 'Delete a specific brand by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the brand to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Brand successfully deleted',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        deletedBrand: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            logo: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid ID format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteBrand(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string; deletedBrand: Brand }> {
    try {
      const deletedBrand = await this.brandService.deleteBrand(id);
      return {
        message: 'Brand successfully deleted',
        deletedBrand,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Log the error for debugging
      console.error('Unexpected error in deleteBrand:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the brand',
      );
    }
  }
}
