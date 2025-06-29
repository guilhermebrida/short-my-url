import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

@Injectable()
export class OptionalJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers['authorization'];

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);

      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'default_secret_key',
        });

        const user = await this.userService.findById(payload.sub);
        req.user = user ?? undefined;
      } catch (err) {
        console.log(err)
        req.user = undefined;
      }
    }

    return true; 
  }
}
