import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaMOdule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaMOdule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
