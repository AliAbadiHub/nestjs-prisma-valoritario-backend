import { Test, TestingModule } from '@nestjs/testing';
import { BrandproductController } from './brandproduct.controller';
import { BrandproductService } from './brandproduct.service';

describe('BrandproductController', () => {
  let controller: BrandproductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandproductController],
      providers: [BrandproductService],
    }).compile();

    controller = module.get<BrandproductController>(BrandproductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
