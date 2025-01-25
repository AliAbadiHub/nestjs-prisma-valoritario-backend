import { IsString, IsOptional } from 'class-validator';

export class CreateFranchiseDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  logo?: string;
}
