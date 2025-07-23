import { Test, TestingModule } from '@nestjs/testing';
import { LgmController } from './lgm.controller';
import { LgmService } from './lgm.service';

describe('LgmController', () => {
  let lgmController: LgmController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LgmController],
      providers: [LgmService],
    }).compile();

    lgmController = app.get<LgmController>(LgmController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(lgmController.getHello()).toBe('Hello World!');
    });
  });
});
