import {
  IsUUID,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupermarketProductDto {
  @ApiProperty({
    description: 'The ID of the supermarket.',
    example: 'f1940f34-ff22-4117-9e0d-8653ed2f0bcf',
  })
  @IsUUID()
  supermarketId: string;

  @ApiProperty({
    description: 'The ID of the brand-product relationship.',
    example: '5f6bda38-88c1-42c2-9a17-4fd6d9c14dc9',
  })
  @IsUUID()
  brandProductId: string;

  @ApiProperty({
    description: 'The unit size of the product.',
    example: '500ml',
  })
  @IsString()
  unit: string;

  @ApiProperty({ description: 'The price of the product.', example: 1.99 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Whether the product is in stock.',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  inStock?: boolean = true;
}
