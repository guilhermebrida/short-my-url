import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class ShortenDto {
  @ApiProperty( {example:"https://github.com/guilhermebrida/short-my-url"})
  @IsUrl()
  originalUrl: string;
}