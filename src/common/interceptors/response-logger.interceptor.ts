import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';

@Injectable()
export class ResponseLoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      tap((data) => {
        console.log(`[${req.method}] ${req.url} → Response:`, JSON.stringify(data, null, 2));
      }),
      catchError((err) => {
        console.error(`[${req.method}] ${req.url} → Error:`, err?.response || err.message);
        throw err;
      })
    );
  }
}
