import { IsUrl } from 'class-validator';

export class ShortenDto {
  @IsUrl()
  originalUrl: string;
}