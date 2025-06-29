import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShortUrl } from './short-url.entity';
import { User } from '../user/user.entity';
import { IsNull } from 'typeorm';

@Injectable()
export class ShortUrlService {
  constructor(
    @InjectRepository(ShortUrl)
    private readonly shortUrlRepo: Repository<ShortUrl>,
  ) {}

  private generateShortCode(length = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async shorten(originalUrl: string, user?: User): Promise<string> {
    let shortCode = this.generateShortCode();

    while (await this.shortUrlRepo.findOneBy({ shortCode })) {
      shortCode = this.generateShortCode();
    }

    const entity = this.shortUrlRepo.create({
      originalUrl,
      shortCode,
      user: user ?? undefined,
    });

    await this.shortUrlRepo.save(entity);

    const domain = process.env.BASE_URL || 'http://localhost:3000';
    return `${domain}/${shortCode}`;
  }

    async findByCode(code: string): Promise<ShortUrl | null> {
    return this.shortUrlRepo.findOne({
        where: { shortCode: code, deletedAt: IsNull() },
    });
    }

    async incrementClickCount(id: string): Promise<void> {
    await this.shortUrlRepo.increment({ id }, 'clickCount', 1);
    }
}
