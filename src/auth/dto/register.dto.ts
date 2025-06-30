import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user'})
  name: string;

  @ApiProperty({ example: 'user@email.com' })
  email: string;

  @ApiProperty({ example: 'password123' })
  password: string;
}