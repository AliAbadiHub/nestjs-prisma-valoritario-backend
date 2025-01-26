import {
  IsOptional,
  IsString,
  IsArray,
  IsNumber,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GetSupermarketProductDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  supermarketIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  brandProductIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  brandIds?: string[];

  @IsOptional()
  @IsString()
  productName?: string; // New field for searching by product name

  @IsOptional()
  @IsString()
  brandName?: string; // New field for searching by brand name

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  maxPrice?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  inStock?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['price', 'createdAt', 'updatedAt'])
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  page: number = 1;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  limit: number = 10;
}
