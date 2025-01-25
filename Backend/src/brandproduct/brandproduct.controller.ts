import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  BadRequestException,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandProductDto } from './dto/create-brandproduct.dto';
// import { UpdateBrandproductDto } from './dto/update-brandproduct.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiSecurity,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { BrandProductService } from './brandproduct.service';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';

@Controller('brandproduct')
@ApiTags('brandproducts')
@ApiBearerAuth()
export class BrandProductController {
  constructor(private readonly brandProductService: BrandProductService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MERCHANT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiOperation({ summary: 'Create a new BrandProduct' })
  @ApiBody({
    type: CreateBrandProductDto,
    description: 'BrandProduct data',
    examples: {
      branded: {
        summary: 'Branded Product',
        value: {
          brandId: '2e7cba03-786f-4c2a-884f-1aa3ca717b65',
          productId: '9d4cc102-7bc8-4d60-a539-0dc98ca9323b',
        },
      },
      unbranded: {
        summary: 'Unbranded Product',
        value: {
          productId: '8b2d3c4d-5678-90ef-ab12-34567890cdef',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created the BrandProduct.',
    schema: {
      example: {
        id: '7b2d3c4d-5678-90ef-ab12-34567890aaaa',
        brandId: '123e4567-e89b-12d3-a456-426614174000',
        productId: '9d4cc102-7bc8-4d60-a539-0dc98ca9323b',
        createdAt: '2025-01-20T12:00:00.000Z',
        updatedAt: '2025-01-20T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Brand or Product not found.',
    schema: {
      example: {
        statusCode: 404,
        message:
          'Product with ID 8b2d3c4d-5678-90ef-ab12-34567890cdef not found.',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'A BrandProduct with this combination already exists.',
  })
  @ApiResponse({
    status: 500,
    description: 'An unexpected error occurred.',
  })
  @UsePipes(ValidationPipe)
  async create(@Body() createBrandProductDto: CreateBrandProductDto) {
    return this.brandProductService.createBrandProduct(createBrandProductDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MERCHANT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiOperation({
    summary: 'Get all BrandProducts with pagination and filters',
  })
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
    name: 'productId',
    required: false,
    type: String,
    description: 'Filter BrandProducts by productId',
    example: '8b2d3c4d-5678-90ef-ab12-34567890cdef',
  })
  @ApiQuery({
    name: 'brandId',
    required: false,
    type: String,
    description: 'Filter BrandProducts by brandId',
    example: '00000000-0000-0000-0000-UNBRANDED00',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the filtered BrandProducts.',
    schema: {
      example: {
        brandProducts: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            createdAt: '2025-01-20T12:00:00.000Z',
            updatedAt: '2025-01-20T12:00:00.000Z',
            brand: {
              id: '123e4567-e89b-12d3-a456-426614174001',
              name: 'Nestle',
            },
            product: {
              id: '8b2d3c4d-5678-90ef-ab12-34567890cdef',
              name: 'White Granulated Sugar',
            },
          },
        ],
        total: 10,
        page: 1,
        limit: 5,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid pagination parameters or filter values.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized access.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient role.',
  })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('productId') productId?: string,
    @Query('brandId') brandId?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    if (parsedPage < 1 || parsedLimit < 1) {
      throw new BadRequestException('Page and limit must be greater than 0.');
    }

    return this.brandProductService.getBrandProducts(parsedPage, parsedLimit, {
      productId,
      brandId,
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MERCHANT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiOperation({ summary: 'Retrieve a BrandProduct by its ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The UUID of the BrandProduct to retrieve',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the BrandProduct.',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        brand: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Nestle',
        },
        product: {
          id: 'a2a7ae9c-0da4-4b76-8b0f-782f51acecda',
          name: 'White Granulated Sugar',
        },
        createdAt: '2025-01-20T12:00:00.000Z',
        updatedAt: '2025-01-20T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'BrandProduct not found.',
    schema: {
      example: {
        statusCode: 404,
        message:
          'BrandProduct with ID 123e4567-e89b-12d3-a456-426614174000 not found.',
        error: 'Not Found',
      },
    },
  })
  async findOne(@Param('id') id: string) {
    const brandProduct = await this.brandProductService.getBrandProductById(id);
    if (!brandProduct) {
      throw new NotFoundException(`BrandProduct with ID ${id} not found.`);
    }
    return brandProduct;
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateBrandproductDto: UpdateBrandproductDto,
  // ) {
  //   return this.brandProductService.update(+id, updateBrandproductDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandProductService.remove(+id);
  }
}
