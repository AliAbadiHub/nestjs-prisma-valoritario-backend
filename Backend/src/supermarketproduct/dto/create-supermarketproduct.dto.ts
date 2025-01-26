import { IsUUID, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class CreateSupermarketProductDto {
  @IsUUID()
  supermarketId: string;

  @IsUUID()
  brandProductId: string; // Only brandProductId is needed, as it ties to a product

  @IsNumber()
  @IsPositive()
  price: number;

  @IsOptional()
  unit?: string; // Optional, as it can be inferred from the product
}
