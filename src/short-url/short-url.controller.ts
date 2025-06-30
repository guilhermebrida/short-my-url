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
  UnauthorizedException,
} from '@nestjs/common';
import { ShortUrlService } from './short-url.service';
import { ShortenDto } from './dto/shorten.dto';
import { OptionalJwtGuard } from '../auth/optional-jwt.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request, Response } from 'express';
import { User } from '../user/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Short URLs')
@Controller()
export class ShortUrlController {
  constructor(private readonly shortUrlService: ShortUrlService) {}

  @Post('shorten')
  @HttpCode(201)
  @UseGuards(OptionalJwtGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Encurtar uma URL' })
  @ApiBody({ type: ShortenDto })
  @ApiResponse({
    status: 201,
    description: 'URL encurtada com sucesso',
    schema: {
      example: {
        shortUrl: 'http://localhost:3000/AUB4DC',
      },
    },
  })
  shorten(@Body() dto: ShortenDto, @Req() req: Request) {
    const user = req.user ? (req.user as User) : undefined;
    return this.shortUrlService.shorten(dto.originalUrl, user).then((shortUrl) => ({ shortUrl }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-urls')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Listar URLs encurtadas do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Lista de URLs encurtadas',
    schema: {
      example: [
        {
          id: 'uuid',
          originalUrl: 'https://example.com',
          shortCode: 'ABC123',
          clickCount: 5,
          createdAt: '2025-06-29T05:26:12.276Z',
          updatedAt: '2025-06-29T05:26:12.276Z',
        },
      ],
    },
  })
  getMyUrls(@Req() req: Request) {
    const user = req.user as User;
    if (!user) throw new UnauthorizedException('Acesso não autorizado');
    return this.shortUrlService.findAllByUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Atualizar URL original de um código encurtado' })
  @ApiParam({ name: 'id', description: 'UUID da URL encurtada' })
  @ApiBody({
    schema: {
      example: {
        originalUrl: 'https://nova-url.com',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'URL atualizada com sucesso' })
  updateShortUrl(
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Excluir uma URL encurtada (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID da URL encurtada' })
  @ApiResponse({
    status: 200,
    description: 'URL excluída com sucesso',
    schema: {
      example: {
        message: 'URL excluída com sucesso',
      },
    },
  })
  async deleteShortUrl(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as User;
    await this.shortUrlService.softDeleteUserUrl(id, user.id);
    return { message: 'URL excluída com sucesso' };
  }

  @Get(':shortCode')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Redirecionar para a URL original a partir do código' })
  @ApiParam({ name: 'shortCode', description: 'Código encurtado da URL' })
  @ApiResponse({ status: 302, description: 'Redirecionamento para a URL original' })
  @ApiResponse({ status: 404, description: 'URL não encontrada ou excluída' })
  async redirect(@Param('shortCode') shortCode: string, @Res() res: Response) {
    const shortUrl = await this.shortUrlService.findByCode(shortCode);

    if (!shortUrl || shortUrl.deletedAt) {
      throw new NotFoundException('URL encurtada não encontrada ou foi excluída');
    }

    await this.shortUrlService.incrementClickCount(shortUrl.id);
    return res.redirect(shortUrl.originalUrl);
  }
}
