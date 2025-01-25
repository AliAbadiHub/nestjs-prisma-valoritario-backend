import { Test, TestingModule } from '@nestjs/testing';
import { BrandproductService } from './brandproduct.service';

describe('BrandproductService', () => {
  let service: BrandproductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrandproductService],
    }).compile();

    service = module.get<BrandproductService>(BrandproductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
