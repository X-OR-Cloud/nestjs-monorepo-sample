import { Test, TestingModule } from '@nestjs/testing';
import { NsmController } from './nsm.controller';
import { NsmService } from './nsm.service';

describe('NsmController', () => {
  let nsmController: NsmController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NsmController],
      providers: [NsmService],
    }).compile();

    nsmController = app.get<NsmController>(NsmController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(nsmController.getHello()).toBe('Hello World!');
    });
  });
});
