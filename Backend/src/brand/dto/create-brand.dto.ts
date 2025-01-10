import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({
    description: 'The name of the brand',
    example: 'Nestle',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'The URL of the brand logo',
    example: 'https://example.com/nestle-logo.png',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: 'Logo must be a valid URL' })
  @MaxLength(255)
  logo?: string;
}
