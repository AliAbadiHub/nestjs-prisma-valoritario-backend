import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { BrandModule } from './brand/brand.module';
import { SupermarketModule } from './supermarket/supermarket.module';
import { FranchiseModule } from './franchise/franchise.module';
import { BrandproductModule } from './brandproduct/brandproduct.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    PrismaModule,
    ProductModule,
    BrandModule,
    SupermarketModule,
    FranchiseModule,
    BrandproductModule,
  ],
})
export class AppModule {}
