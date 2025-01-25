import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateBrandProductDto } from './dto/create-brandproduct.dto';
import { UpdateBrandproductDto } from './dto/update-brandproduct.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { BrandProductService } from './brandproduct.service';

@Controller('brandproduct')
@ApiTags('brandproducts')
export class BrandProductController {
  constructor(private readonly brandProductService: BrandProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new BrandProduct' })
  @ApiBody({
    description: 'BrandProduct data',
    examples: {
      branded: {
        summary: 'Branded Product',
        value: {
          brandId: '123e4567-e89b-12d3-a456-426614174000',
          productId: '9d4cc102-7bc8-4d60-a539-0dc98ca9323b',
          name: 'Nestle All-Purpose Flour',
        },
      },
      unbranded: {
        summary: 'Unbranded Product',
        value: {
          productId: '8b2d3c4d-5678-90ef-ab12-34567890cdef',
          name: 'Fresh Potatoes',
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
        name: 'Nestle All-Purpose Flour',
        createdAt: '2025-01-20T12:00:00.000Z',
        updatedAt: '2025-01-20T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Brand or Product not found.',
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
  findAll() {
    return this.brandProductService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandProductService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBrandproductDto: UpdateBrandproductDto,
  ) {
    return this.brandProductService.update(+id, updateBrandproductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandProductService.remove(+id);
  }
}
