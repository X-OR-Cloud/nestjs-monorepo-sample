import { Test, TestingModule } from '@nestjs/testing';
import { BpmController } from './bpm.controller';
import { BpmService } from './bpm.service';

describe('BpmController', () => {
  let bpmController: BpmController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BpmController],
      providers: [BpmService],
    }).compile();

    bpmController = app.get<BpmController>(BpmController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(bpmController.getHello()).toBe('Hello World!');
    });
  });
});
