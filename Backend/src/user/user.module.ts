import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserOwnershipGuard } from 'src/auth/guards/user-ownership.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, UserOwnershipGuard, RolesGuard],
  exports: [UserService],
})
export class UserModule {}
