import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UserService } from '../service/user.service';

describe('AppController', () => {
  let appController: UsersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UserService],
    }).compile();

    appController = app.get<UsersController>(UsersController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
