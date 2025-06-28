import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ example: 'user@email.com' })
  email: string;

  @ApiProperty()
  password: string;
}