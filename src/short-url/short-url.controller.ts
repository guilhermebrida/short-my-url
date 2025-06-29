import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  Param,
  Get,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { ShortUrlService } from './short-url.service';
import { ShortenDto } from './dto/shorten.dto';
import { OptionalJwtGuard } from '../auth/optional-jwt.guard'; 
import { Request, Response } from 'express';
import { User } from '../user/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller()
export class ShortUrlController {
  constructor(private readonly shortUrlService: ShortUrlService) {}

  @Post('shorten')
  @HttpCode(201)
  @UseGuards(OptionalJwtGuard) 
  async shorten(@Body() dto: ShortenDto, @Req() req: Request) {
    const user = req.user ? (req.user as User) : undefined;
    console.log(user);
    const shortUrl = await this.shortUrlService.shorten(dto.originalUrl, user);
    return { shortUrl };
  }

@Get(':shortCode')
  async redirect(@Param('shortCode') shortCode: string, @Res() res: Response) {
    const shortUrl = await this.shortUrlService.findByCode(shortCode);

    if (!shortUrl || shortUrl.deletedAt) {
      throw new NotFoundException('URL encurtada não encontrada ou foi excluída');
    }

    await this.shortUrlService.incrementClickCount(shortUrl.id);
    return res.redirect(shortUrl.originalUrl);
  }
}
