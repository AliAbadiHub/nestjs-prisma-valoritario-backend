// create-product.dto.ts
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ProductCategory } from '@prisma/client';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsNotEmpty()
  @IsString()
  defaultUnit: string;
}
