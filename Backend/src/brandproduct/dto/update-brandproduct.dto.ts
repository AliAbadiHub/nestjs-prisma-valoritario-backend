import { PartialType } from '@nestjs/swagger';
import { CreateBrandProductDto } from './create-brandproduct.dto';

export class UpdateBrandproductDto extends PartialType(CreateBrandProductDto) {}
