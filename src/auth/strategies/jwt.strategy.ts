import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService, JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    const cookieName = config.get<string>('COOKIE_NAME') || 'access_token';

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          if (req?.cookies?.[cookieName]) {
            return req.cookies[cookieName] as string;
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'change-me',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.getUserFromPayload(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
