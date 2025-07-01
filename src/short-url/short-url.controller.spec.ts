import { Test, TestingModule } from '@nestjs/testing';
import { ShortUrlController } from './short-url.controller';
import { ShortUrlService } from './short-url.service';
import { ShortenDto } from './dto/shorten.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { OptionalJwtGuard } from '../auth/optional-jwt.guard';

const mockUser = { id: 'user-id' } as any;
const mockReq = { user: mockUser } as any;
const mockRes = {
  redirect: jest.fn(),
} as any;

const mockShortUrl = {
  id: 'short-id',
  originalUrl: 'https://example.com',
  shortCode: 'ABC123',
  deletedAt: null,
};

describe('ShortUrlController', () => {
  let controller: ShortUrlController;
  let service: ShortUrlService;

  const mockService = {
    shorten: jest.fn().mockResolvedValue('http://localhost:3000/ABC123'),
    findAllByUser: jest.fn().mockResolvedValue([mockShortUrl]),
    updateUserUrl: jest.fn().mockResolvedValue({ ...mockShortUrl, originalUrl: 'https://updated.com' }),
    softDeleteUserUrl: jest.fn().mockResolvedValue(undefined),
    findByCode: jest.fn().mockResolvedValue(mockShortUrl),
    incrementClickCount: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortUrlController],
      providers: [{ provide: ShortUrlService, useValue: mockService }],
    })
      .overrideGuard(OptionalJwtGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // sempre permite passar
      .compile();

    controller = module.get<ShortUrlController>(ShortUrlController);
    service = module.get<ShortUrlService>(ShortUrlService);
  });

  it('should shorten a URL', async () => {
    const dto: ShortenDto = { originalUrl: 'https://example.com' };
    const result = await controller.shorten(dto, mockReq);
    expect(result).toEqual({ shortUrl: 'http://localhost:3000/ABC123' });
    expect(service.shorten).toHaveBeenCalledWith(dto.originalUrl, mockUser);
  });

  it('should list URLs by user', async () => {
    const result = await controller.getMyUrls(mockReq);
    expect(result).toEqual([mockShortUrl]);
    expect(service.findAllByUser).toHaveBeenCalledWith(mockUser.id);
  });

  // it('should throw unauthorized if no user on getMyUrls', async () => {
  //   const req = { user: undefined } as any;
  //   expect(controller.getMyUrls(req)).rejects.toThrow(UnauthorizedException);
  // });

  it('should update a short URL', async () => {
    const result = await controller.updateShortUrl('short-id', 'https://updated.com', mockReq);
    expect(result.originalUrl).toEqual('https://updated.com');
    expect(service.updateUserUrl).toHaveBeenCalledWith('short-id', 'https://updated.com', mockUser.id);
  });

  it('should delete a short URL', async () => {
    const result = await controller.deleteShortUrl('short-id', mockReq);
    expect(result).toEqual({ message: 'URL excluída com sucesso' });
    expect(service.softDeleteUserUrl).toHaveBeenCalledWith('short-id', mockUser.id);
  });

  it('should redirect to original URL', async () => {
    const result = await controller.redirect('ABC123', mockRes);
    expect(service.findByCode).toHaveBeenCalledWith('ABC123');
    expect(service.incrementClickCount).toHaveBeenCalledWith('short-id');
    expect(mockRes.redirect).toHaveBeenCalledWith('https://example.com');
  });
});