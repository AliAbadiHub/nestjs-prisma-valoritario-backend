import { PartialType } from '@nestjs/swagger';
import { CreateSupermarketProductDto } from './create-supermarketproduct.dto';

export class UpdateSupermarketproductDto extends PartialType(
  CreateSupermarketProductDto,
) {}
