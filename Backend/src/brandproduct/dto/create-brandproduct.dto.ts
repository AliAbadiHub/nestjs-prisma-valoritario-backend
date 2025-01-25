import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateBrandProductDto {
  @IsUUID()
  @IsOptional() // Admin/Merchant can omit this field
  brandId?: string;

  @IsUUID()
  productId: string;

  @IsString()
  name: string;
}
