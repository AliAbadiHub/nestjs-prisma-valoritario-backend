import {
  Controller,
  // Get,
  Post,
  Body,
  // Patch,
  // Param,
  // Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SupermarketService } from './supermarket.service';
import { CreateSupermarketDto } from './dto/create-supermarket.dto';
// import { UpdateSupermarketDto } from './dto/update-supermarket.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';

@Controller('supermarket')
@ApiTags('supermarket')
@ApiBearerAuth()
export class SupermarketController {
  constructor(private readonly supermarketService: SupermarketService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MERCHANT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiOperation({ summary: 'Create a new supermarket' })
  @ApiBody({
    type: CreateSupermarketDto,
    description: 'Supermarket data to create',
    examples: {
      validSupermarket: {
        summary: 'Valid Supermarket',
        value: {
          name: 'Mas Por Menos',
          openingHours: {
            monday: '09:00-21:00',
            tuesday: '09:00-21:00',
            wednesday: '09:00-21:00',
            thursday: '09:00-21:00',
            friday: '09:00-22:00',
            saturday: '10:00-22:00',
            sunday: '10:00-20:00',
          },
          address: 'Principal De Lecheria Frente De CDLC',
          city: 'Lecheria',
          phoneNumber: '+1234567890',
          website: 'https://www.supermarketabc.com',
          latitude: 40.7128,
          longitude: -74.006,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The supermarket has been successfully created.',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Mas Por Menos',
        franchiseId: null,
        openingHours: {
          monday: '09:00-21:00',
          tuesday: '09:00-21:00',
          wednesday: '09:00-21:00',
          thursday: '09:00-21:00',
          friday: '09:00-22:00',
          saturday: '10:00-22:00',
          sunday: '10:00-20:00',
        },
        phoneNumber: '+1234567890',
        address: 'Principal De Lecheria Frente De CDLC',
        city: 'Lecheria',
        website: 'https://www.supermarketabc.com',
        latitude: 40.7128,
        longitude: -74.006,
        createdAt: '2023-04-20T14:30:00Z',
        updatedAt: '2023-04-20T14:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data.',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'name must be a string',
          'openingHours must be an object',
          'address must be a string',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - A supermarket with that name and address already exists.',
    schema: {
      example: {
        statusCode: 409,
        message:
          'A supermarket with the name "Supermarket ABC" at address "123 Main St" already exists',
        error: 'Conflict',
      },
    },
  })
  @UsePipes(ValidationPipe)
  async createSupermarket(@Body() createSupermarketDto: CreateSupermarketDto) {
    return this.supermarketService.createSupermarket(createSupermarketDto);
  }

  // @Get()
  // findAll() {
  //   return this.supermarketService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id', new ParseUUIDPipe()) id: string) {
  //   return this.supermarketService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id', new ParseUUIDPipe()) id: string,
  //   @Body() updateSupermarketDto: UpdateSupermarketDto,
  // ) {
  //   return this.supermarketService.update(+id, updateSupermarketDto);
  // }

  // @Delete(':id')
  // remove(@Param('id', new ParseUUIDPipe()) id: string) {
  //   return this.supermarketService.remove(+id);
  // }
}
