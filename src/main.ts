import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, "");
}

function parseFrontendOrigins(frontendUrl: string): string[] {
  return frontendUrl.split(",").map(normalizeOrigin).filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix("api");
  app.use(cookieParser());

  const frontendUrl =
    config.get<string>("FRONTEND_URL") ||
    "https://aiseekhegaindia-frontend.vercel.app";
  const allowedOrigins = parseFrontendOrigins(frontendUrl);
  console.log(`CORS allowlist: ${allowedOrigins.join(", ") || "(empty)"}`);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean | string) => void,
    ) => {
      // Allow non-browser clients (no Origin header) and FRONTEND_URL allowlist.
      // Never pass an Error here — cors treats that as a 500 Internal Server Error.
      // With credentials:true, echo the exact request origin (not `true`/`*`).
      if (!origin) {
        callback(null, true);
        return;
      }
      const normalized = normalizeOrigin(origin);
      if (allowedOrigins.includes(normalized)) {
        callback(null, normalized);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  });

  const port = config.get<number>("PORT") || 4000;
  await app.listen(port);
  console.log(`Backend listening on http://localhost:${port}`);
}

bootstrap();
