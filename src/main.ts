import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    origin: config.get<string>('FRONTEND_URL') || 'http://localhost:3000',
    credentials: true,
  });

  const port = config.get<number>('PORT') || 4000;
  await app.listen(port);
  console.log(`Backend listening on http://localhost:${port}`);
}

bootstrap();
