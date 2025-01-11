// create-supermarket.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  IsUrl,
} from 'class-validator';

export class CreateSupermarketDto {
  @ApiProperty({ example: 'Supermarket ABC' })
  @IsString()
  name: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  franchiseId?: string;

  @ApiProperty({
    example: {
      monday: '09:00-21:00',
      tuesday: '09:00-21:00',
      wednesday: '09:00-21:00',
      thursday: '09:00-21:00',
      friday: '09:00-22:00',
      saturday: '10:00-22:00',
      sunday: '10:00-20:00',
    },
  })
  @IsObject()
  openingHours: Record<string, string>;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'https://www.supermarketabc.com', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ example: 40.7128, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: -74.006, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
