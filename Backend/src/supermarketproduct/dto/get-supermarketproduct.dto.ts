import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GetSupermarketProductDto {
  @ApiProperty({
    description: 'Filter by supermarkets in a specific city.',
    example: 'Caracas',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'Filter by supermarket name (partial match).',
    example: 'Mas por Menos',
    required: false,
  })
  @IsOptional()
  @IsString()
  supermarketName?: string;

  @ApiProperty({
    description: 'Filter by product name (partial match).',
    example: 'Corn Oil',
    required: false,
  })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({
    description: 'Filter by brand name (partial match).',
    example: 'Mavesa',
    required: false,
  })
  @IsOptional()
  @IsString()
  brandName?: string;

  @ApiProperty({
    description: 'Filter by unit (exact match).',
    example: '500ml',
    required: false,
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    description: 'Filter by availability.',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true') // Converts string 'true'/'false' to boolean
  @IsBoolean()
  inStock?: boolean;

  @ApiProperty({
    description: 'Page number (default: 1).',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value)) // Converts string to number
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page (default: 10).',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value)) // Converts string to number
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
