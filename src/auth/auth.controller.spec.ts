import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call authService.register with correct DTO and return result', async () => {
      const dto: RegisterDto = {
        name:'test',
        email: 'test@example.com',
        password: '123456',
      };

      const expectedResult = { id: 1, email: dto.email };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await authController.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should call authService.login with email and password and return result', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: '123456',
      };

      const expectedResult = { accessToken: 'token' };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await authController.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto.email, dto.password);
      expect(result).toEqual(expectedResult);
    });
  });
});
