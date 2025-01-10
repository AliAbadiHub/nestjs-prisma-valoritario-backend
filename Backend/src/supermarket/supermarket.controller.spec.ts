import { Test, TestingModule } from '@nestjs/testing';
import { SupermarketController } from './supermarket.controller';
import { SupermarketService } from './supermarket.service';

describe('SupermarketController', () => {
  let controller: SupermarketController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupermarketController],
      providers: [SupermarketService],
    }).compile();

    controller = module.get<SupermarketController>(SupermarketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
