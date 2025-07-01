import { Test, TestingModule } from '@nestjs/testing';
import { ShortUrlService } from './short-url.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShortUrl } from './short-url.entity';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';
import { ForbiddenException } from '@nestjs/common';

describe('ShortUrlService', () => {
  let service: ShortUrlService;
  let repo: Repository<ShortUrl>;

  const mockRepo = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    increment: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortUrlService,
        {
          provide: getRepositoryToken(ShortUrl),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ShortUrlService>(ShortUrlService);
    repo = module.get<Repository<ShortUrl>>(getRepositoryToken(ShortUrl));
  });

  afterEach(() => jest.clearAllMocks());

  it('should shorten a URL and return full short URL', async () => {
    mockRepo.findOneBy.mockResolvedValue(null);
    mockRepo.create.mockImplementation((data) => data);
    mockRepo.save.mockResolvedValue({ shortCode: 'abc123' });

    const result = await service.shorten('https://example.com');
    expect(result).toContain('/');
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('should find by code', async () => {
    const shortUrl = { shortCode: 'abc123' } as ShortUrl;
    mockRepo.findOne.mockResolvedValue(shortUrl);

    const result = await service.findByCode('abc123');
    expect(result).toEqual(shortUrl);
  });

  it('should increment click count', async () => {
    await service.incrementClickCount('some-id');
    expect(mockRepo.increment).toHaveBeenCalledWith({ id: 'some-id' }, 'clickCount', 1);
  });

  it('should find all URLs by user', async () => {
    const urls = [{ id: '1' }] as ShortUrl[];
    mockRepo.find.mockResolvedValue(urls);

    const result = await service.findAllByUser('user-id');
    expect(result).toEqual(urls);
  });

  it('should update a URL for the correct user', async () => {
    const url = { id: '1', user: { id: 'user-id' }, originalUrl: 'old' } as ShortUrl;
    mockRepo.findOne.mockResolvedValue(url);
    mockRepo.save.mockResolvedValue({ ...url, originalUrl: 'new' });

    const result = await service.updateUserUrl('1', 'new', 'user-id');
    expect(result.originalUrl).toBe('new');
  });

  it('should throw if updating a URL from another user', async () => {
    mockRepo.findOne.mockResolvedValue({ user: { id: 'other-user' } });
    await expect(service.updateUserUrl('1', 'new', 'user-id')).rejects.toThrow(ForbiddenException);
  });

  it('should soft delete a URL', async () => {
    const url = { id: '1', user: { id: 'user-id' } } as ShortUrl;
    mockRepo.findOne.mockResolvedValue(url);
    mockRepo.save.mockResolvedValue({ ...url, deletedAt: new Date() });

    await service.softDeleteUserUrl('1', 'user-id');
    expect(mockRepo.save).toHaveBeenCalled();
  });

  it('should throw if trying to delete a URL from another user', async () => {
    mockRepo.findOne.mockResolvedValue({ user: { id: 'other-user' } });
    await expect(service.softDeleteUserUrl('1', 'user-id')).rejects.toThrow(ForbiddenException);
  });
});
