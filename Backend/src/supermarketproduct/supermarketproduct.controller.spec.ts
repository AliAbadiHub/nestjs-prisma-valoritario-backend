import { Test, TestingModule } from '@nestjs/testing';
import { SupermarketProductController } from './supermarketproduct.controller';
import { SupermarketProductService } from './supermarketproduct.service';

describe('SupermarketproductController', () => {
  let controller: SupermarketProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupermarketProductController],
      providers: [SupermarketProductService],
    }).compile();

    controller = module.get<SupermarketProductController>(
      SupermarketProductController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
