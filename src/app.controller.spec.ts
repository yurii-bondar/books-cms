import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  const mockAppService = {
    about: jest.fn(() => ({
      name: 'test-name',
      version: '1.0.0',
      description: 'Test description',
      dateNow: '10.02.2025, 12:00:00',
      startDate: '10.02.2025, 11:00:00',
    })),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService, // Використовуємо мок-сервіс
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  it('should return about data', () => {
    const result = appController.about();

    expect(result).toEqual({
      name: 'test-name',
      version: '1.0.0',
      description: 'Test description',
      dateNow: '10.02.2025, 12:00:00',
      startDate: '10.02.2025, 11:00:00',
    });

    expect(mockAppService.about).toHaveBeenCalled();
  });
});
