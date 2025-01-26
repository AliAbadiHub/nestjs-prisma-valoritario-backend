import { Test, TestingModule } from '@nestjs/testing';
import { SupermarketproductService } from './supermarketproduct.service';

describe('SupermarketproductService', () => {
  let service: SupermarketproductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupermarketproductService],
    }).compile();

    service = module.get<SupermarketproductService>(SupermarketproductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
