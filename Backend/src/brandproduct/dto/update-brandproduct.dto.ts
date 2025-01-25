import { PartialType } from '@nestjs/swagger';
import { CreateBrandProductDto } from './create-brandproduct.dto';

export class UpdateBrandProductDto extends PartialType(CreateBrandProductDto) {}
