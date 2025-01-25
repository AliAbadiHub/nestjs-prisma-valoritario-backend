import { IsUUID, IsOptional } from 'class-validator';
import { IsValidUUIDOrUnbranded } from 'src/validators/is-valid-uuid-or-unbranded.decorator';

export class CreateBrandProductDto {
  @IsValidUUIDOrUnbranded({
    message:
      'brandId must be a valid UUID (version 4) or the unbranded placeholder UUID.',
  })
  @IsOptional() // Allow omitting for unbranded items
  brandId?: string;

  @IsUUID('4', { message: 'productId must be a valid UUID (version 4).' })
  productId: string;
}
