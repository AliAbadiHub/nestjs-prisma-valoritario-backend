import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SupermarketService } from './supermarket.service';
import { CreateSupermarketDto } from './dto/create-supermarket.dto';
import { UpdateSupermarketDto } from './dto/update-supermarket.dto';

@Controller('supermarket')
export class SupermarketController {
  constructor(private readonly supermarketService: SupermarketService) {}

  @Post()
  create(@Body() createSupermarketDto: CreateSupermarketDto) {
    return this.supermarketService.create(createSupermarketDto);
  }

  @Get()
  findAll() {
    return this.supermarketService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.supermarketService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSupermarketDto: UpdateSupermarketDto) {
    return this.supermarketService.update(+id, updateSupermarketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.supermarketService.remove(+id);
  }
}
