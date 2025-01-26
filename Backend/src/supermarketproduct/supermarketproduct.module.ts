import { Module } from '@nestjs/common';
import { SupermarketProductService } from './supermarketproduct.service';
import { SupermarketProductController } from './supermarketproduct.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SupermarketProductController],
  providers: [SupermarketProductService],
})
export class SupermarketproductModule {}
