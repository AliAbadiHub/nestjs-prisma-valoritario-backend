import { ApiProperty } from '@nestjs/swagger';
import { ProductCategory } from '@prisma/client';
import {
  IsString,
  IsEnum,
  IsArray,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Organic Whole Milk',
    description: 'The name of the product',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Fresh organic whole milk from local farms',
    description: 'A description of the product',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: ProductCategory,
    example: ProductCategory.DAIRY,
    description: 'The category of the product',
  })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiProperty({
    example: ['liter', 'gallon'],
    description: 'The units in which the product is sold',
  })
  @IsArray()
  @IsString({ each: true })
  units: string[];

  @ApiProperty({
    example: true,
    description: 'Whether the product is typically branded',
    default: false,
  })
  @IsBoolean()
  isTypicallyBranded: boolean;
}
