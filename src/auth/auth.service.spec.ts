import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let usersRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUsersRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const dto: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123456',
      };

      mockUsersRepository.findOne.mockResolvedValue(null);
      const hashedPassword = 'hashedPassword123';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      mockUsersRepository.create.mockReturnValue({ email: dto.email, passwordHash: hashedPassword });
      mockUsersRepository.save.mockResolvedValue(true);

      const result = await authService.register(dto);

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockUsersRepository.create).toHaveBeenCalledWith({ email: dto.email, passwordHash: hashedPassword });
      expect(mockUsersRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Usuário registrado com sucesso' });
    });

    it('should throw ConflictException if email already exists', async () => {
      const dto: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123456',
      };

      mockUsersRepository.findOne.mockResolvedValue({ id: 1, email: dto.email }); // usuário existe

      await expect(authService.register(dto)).rejects.toThrow(ConflictException);

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(mockUsersRepository.create).not.toHaveBeenCalled();
      expect(mockUsersRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully and return access token', async () => {
      const email = 'test@example.com';
      const password = '123456';

      const user = {
        id: 1,
        email,
        passwordHash: 'hashedPassword',
      };

      mockUsersRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      const token = 'jwtToken';
      mockJwtService.sign.mockReturnValue(token);

      const result = await authService.login(email, password);

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.passwordHash);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: user.id, email: user.email });
      expect(result).toEqual({ accessToken: token });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const email = 'test@example.com';
      const password = '123456';

      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(authService.login(email, password)).rejects.toThrow(UnauthorizedException);

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const email = 'test@example.com';
      const password = '123456';

      const user = {
        id: 1,
        email,
        passwordHash: 'hashedPassword',
      };

      mockUsersRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(authService.login(email, password)).rejects.toThrow(UnauthorizedException);

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.passwordHash);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
