// supermarket-product-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class SupermarketProductResponseDto {
  @ApiProperty({ example: 'Mavesa', description: 'Brand name' })
  brand: string;

  @ApiProperty({ example: 'Corn Oil', description: 'Product name' })
  product: string;

  @ApiProperty({ example: '1L', description: 'Product unit' })
  unit: string;

  @ApiProperty({ example: 4.99, description: 'Current price in USD' })
  price: number;

  @ApiProperty({ example: 'Mas por Menos', description: 'Supermarket name' })
  supermarket: string;

  @ApiProperty({
    example: 'Caracas',
    description: 'City where supermarket is located',
  })
  city: string;

  constructor(data: {
    brand: string;
    product: string;
    unit: string;
    price: number;
    supermarket: string;
    city: string;
  }) {
    this.brand = data.brand;
    this.product = data.product;
    this.unit = data.unit;
    this.price = data.price;
    this.supermarket = data.supermarket;
    this.city = data.city;
  }
}

export class PaginatedSupermarketProductResponseDto {
  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  limit: number;

  @ApiProperty({ example: 100, description: 'Total number of items' })
  total: number;

  @ApiProperty({
    type: [SupermarketProductResponseDto],
    description: 'List of products',
  })
  results: SupermarketProductResponseDto[];

  constructor(data: {
    page: number;
    limit: number;
    total: number;
    results: Array<{
      brand: string;
      product: string;
      unit: string;
      price: number;
      supermarket: string;
      city: string;
    }>;
  }) {
    this.page = data.page;
    this.limit = data.limit;
    this.total = data.total;
    this.results = data.results.map(
      (item) => new SupermarketProductResponseDto(item),
    );
  }
}
