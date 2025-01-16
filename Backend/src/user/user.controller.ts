import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
  Query,
  NotFoundException,
  UseGuards,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role, User } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorators';
import { UserOwnershipGuard } from 'src/auth/guards/user-ownership.guard';

@Controller('user')
@ApiTags('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists.',
  })
  @UsePipes(ValidationPipe)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(
      createUserDto.email,
      createUserDto.password,
    );
    return { ...user, password: undefined };
  }

  @Get()
  @Roles(Role.ADMIN, Role.MERCHANT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiOperation({ summary: 'Get all users' })
  @ApiBearerAuth()
  @ApiSecurity('admin')
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.userService.getUsers(page, limit);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiSecurity('admin')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the user to find',
  })
  @ApiResponse({ status: 200, description: 'Return the user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.getUserById(id);
  }

  @Get('email/search')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search for a user by email' })
  @ApiQuery({
    name: 'email',
    required: true,
    description: 'Email of the user to search for',
  })
  @ApiResponse({ status: 200, description: 'Return the user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  async getUserByEmail(@Query('email') email: string) {
    try {
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      console.error('Controller: Error in getUserByEmail:', error);
      throw error;
    }
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  @ApiOperation({ summary: "Update a user's password" })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the user to update',
  })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.userService.updateUserPassword(id, updateUserDto.password);
    return { message: 'Password updated successfully' };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, UserOwnershipGuard)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'UUID of the user to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully deleted',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        deletedUser: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            role: {
              type: 'string',
              enum: ['BASIC', 'VERIFIED', 'MERCHANT', 'ADMIN'],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid ID format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Cannot delete user due to existing references',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteUser(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string; deletedUser: Partial<User> }> {
    try {
      const deletedUser = await this.userService.deleteUser(id);
      return {
        message: 'User successfully deleted',
        deletedUser,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Unexpected error in deleteUser:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the user',
      );
    }
  }
}
