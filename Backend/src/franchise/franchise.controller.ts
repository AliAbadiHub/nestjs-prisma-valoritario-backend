import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  NotFoundException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FranchiseService } from './franchise.service';
import { CreateFranchiseDto } from './dto/create-franchise.dto';
import { UpdateFranchiseDto } from './dto/update-franchise.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiSecurity,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorators';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';

@Controller('franchise')
@ApiTags('franchise')
@ApiBearerAuth()
export class FranchiseController {
  constructor(private readonly franchiseService: FranchiseService) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiOperation({ summary: 'Create a new franchise' })
  @ApiBody({
    type: CreateFranchiseDto,
    description: 'Franchise data to create',
    examples: {
      validFranchise: {
        summary: 'Valid Franchise',
        value: {
          name: 'MegaMart',
          logo: 'https://example.com/logo.png',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The franchise has been successfully created.',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'MegaMart',
        logo: 'https://example.com/logo.png',
        createdAt: '2023-04-20T14:30:00Z',
        updatedAt: '2023-04-20T14:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - A franchise with this name already exists.',
  })
  @UsePipes(ValidationPipe)
  async create(@Body() createFranchiseDto: CreateFranchiseDto) {
    return this.franchiseService.createFranchise(createFranchiseDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MERCHANT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiOperation({ summary: 'Get all franchises with pagination' })
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
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved franchises.',
    schema: {
      example: {
        franchises: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Supermarkets Co.',
            logo: 'https://example.com/logo.png',
            createdAt: '2023-04-20T14:30:00Z',
            updatedAt: '2023-04-20T14:30:00Z',
          },
        ],
        total: 15,
        page: 1,
        limit: 10,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    return this.franchiseService.getFranchises(parsedPage, parsedLimit);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MERCHANT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiSecurity('admin')
  @ApiSecurity('merchant')
  @ApiOperation({ summary: 'Get a franchise by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the franchise',
    example: '9d4cc102-7bc8-4d60-a539-0dc98ca9323b',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the franchise.',
  })
  @ApiResponse({ status: 404, description: 'Franchise not found' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const franchise = await this.franchiseService.getFranchiseById(id);
    if (!franchise) {
      throw new NotFoundException(`Franchise with ID ${id} not found`);
    }
    return franchise;
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiSecurity('admin')
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Update a franchise by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the franchise',
    example: '9d4cc102-7bc8-4d60-a539-0dc98ca9323b',
  })
  @ApiBody({ type: UpdateFranchiseDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the franchise.',
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateFranchiseDto: UpdateFranchiseDto,
  ) {
    return this.franchiseService.updateFranchise(id, updateFranchiseDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a franchise by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the franchise',
    example: '9d4cc102-7bc8-4d60-a539-0dc98ca9323b',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted the franchise.',
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.franchiseService.deleteFranchise(id);
  }
}
