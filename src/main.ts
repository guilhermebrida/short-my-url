import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseLoggerInterceptor } from './common/interceptors/response-logger.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Exemplo NestJS + Swagger')
    .setDescription('API com documentação Swagger')
    .setVersion('1.0')
    .addBearerAuth({ 
      type: 'http', 
      scheme: 'bearer', 
      bearerFormat: 'JWT',
      name: 'Authorization',
      in: 'header',
    }, 'access-token') 
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.useGlobalInterceptors(new ResponseLoggerInterceptor());

  const port = process.env.PORT || 3000; 
  await app.listen(port);
}
bootstrap();
