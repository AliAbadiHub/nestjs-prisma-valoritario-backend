import { PartialType } from '@nestjs/swagger';
import { CreateSupermarketDto } from './create-supermarket.dto';

export class UpdateSupermarketDto extends PartialType(CreateSupermarketDto) {}
