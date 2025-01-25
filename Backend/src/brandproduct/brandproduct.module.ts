import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BrandProductController } from './brandproduct.controller';
import { BrandProductService } from './brandproduct.service';

@Module({
  imports: [PrismaModule],
  controllers: [BrandProductController],
  providers: [BrandProductService],
})
export class BrandproductModule {}
