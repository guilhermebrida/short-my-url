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
  Delete,
  Patch,
  NotFoundException,
  UnauthorizedException
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



    @UseGuards(JwtAuthGuard)
    @Get('my-urls')
    async getMyUrls(@Req() req: Request) {
        const user = req.user as User;
        if (!user) throw new UnauthorizedException('Acesso não autorizado');
        return this.shortUrlService.findAllByUser(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async updateShortUrl(
    @Param('id') id: string,
    @Body('originalUrl') newUrl: string,
    @Req() req: Request,
    ) {
        const user = req.user as User;
        return this.shortUrlService.updateUserUrl(id, newUrl, user.id);
    }


    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @HttpCode(200)
    async deleteShortUrl(@Param('id') id: string, @Req() req: Request) {
        const user = req.user as User;
        await this.shortUrlService.softDeleteUserUrl(id, user.id);
        return { message: 'URL excluída com sucesso' };
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
