import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  // Param,
  // Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SupermarketService } from './supermarket.service';
import { CreateSupermarketDto } from './dto/create-supermarket.dto';
// import { UpdateSupermarketDto } from './dto/update-supermarket.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
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

  @Get()
  @Roles(Role.ADMIN, Role.MERCHANT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiOperation({ summary: 'Get all supermarkets with filtering options' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter products by name (case-insensitive, partial match)',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    type: String,
    description: 'Filter supermarkets by city',
  })
  @ApiQuery({
    name: 'franchiseId',
    required: false,
    type: String,
    description: 'Filter supermarkets by franchise ID',
  })
  @ApiQuery({
    name: 'hasWebsite',
    required: false,
    type: Boolean,
    description: 'Filter supermarkets by whether they have a website',
  })
  @ApiQuery({
    name: 'hasPhoneNumber',
    required: false,
    type: Boolean,
    description: 'Filter supermarkets by whether they have a phone number',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved supermarkets',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
    @Query('city') city?: string,
    @Query('franchiseId') franchiseId?: string,
    @Query('hasWebsite') hasWebsite?: string,
    @Query('hasPhoneNumber') hasPhoneNumber?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    const parsedHasWebsite = hasWebsite
      ? hasWebsite.toLowerCase() === 'true'
      : undefined;
    const parsedHasPhoneNumber = hasPhoneNumber
      ? hasPhoneNumber.toLowerCase() === 'true'
      : undefined;

    return this.supermarketService.findAll(parsedPage, parsedLimit, {
      name,
      city,
      franchiseId,
      hasWebsite: parsedHasWebsite,
      hasPhoneNumber: parsedHasPhoneNumber,
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MERCHANT, Role.VERIFIED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiSecurity('verified')
  @ApiOperation({ summary: 'Get a specific supermarket by ID' })
  @ApiParam({
    name: 'id',
    description: 'Supermarket ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the supermarket',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        franchiseId: { type: 'string', format: 'uuid', nullable: true },
        openingHours: { type: 'object' },
        phoneNumber: { type: 'string', nullable: true },
        address: { type: 'string', nullable: true },
        city: { type: 'string' },
        website: { type: 'string', nullable: true },
        latitude: { type: 'number', format: 'float', nullable: true },
        longitude: { type: 'number', format: 'float', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        franchise: {
          type: 'object',
          nullable: true,
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
          },
        },
        supermarketProducts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              productId: { type: 'string', format: 'uuid' },
              price: { type: 'number' },
              // Add other relevant properties in the future
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  @ApiResponse({ status: 404, description: 'Supermarket not found' })
  async getSupermarketById(@Param('id', new ParseUUIDPipe()) id: string) {
    const supermarket = await this.supermarketService.getSupermarketById(id);
    if (!supermarket) {
      throw new NotFoundException(`Supermarket with ID ${id} not found`);
    }
    return supermarket;
  }

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
