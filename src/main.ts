import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, '');
}

function parseFrontendOrigins(frontendUrl: string): string[] {
  return frontendUrl
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.use(cookieParser());

  const frontendUrl =
    config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  const allowedOrigins = parseFrontendOrigins(frontendUrl);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow non-browser clients (no Origin header) and FRONTEND_URL allowlist.
      // Never pass an Error here — cors treats that as a 500 Internal Server Error.
      if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  });

  const port = config.get<number>('PORT') || 4000;
  await app.listen(port);
  console.log(`Backend listening on http://localhost:${port}`);
}

bootstrap();
