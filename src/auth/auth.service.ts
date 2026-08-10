import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { UserDocument } from '../users/schemas/user.schema';
import { GoogleProfileInput, UsersService } from '../users/users.service';

export type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateGoogleUser(profile: GoogleProfileInput): Promise<UserDocument> {
    return this.usersService.upsertFromGoogle(profile);
  }

  signToken(user: UserDocument): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.sign(payload);
  }

  setAuthCookie(res: Response, token: string): void {
    const cookieName = this.config.get<string>('COOKIE_NAME') || 'access_token';
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN') || '7d';
    const maxAgeMs = this.parseExpiresToMs(expiresIn);
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie(cookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: maxAgeMs,
      path: '/',
    });
  }

  clearAuthCookie(res: Response): void {
    const cookieName = this.config.get<string>('COOKIE_NAME') || 'access_token';
    const isProd = process.env.NODE_ENV === 'production';

    res.clearCookie(cookieName, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
    });
  }

  async getUserFromPayload(payload: JwtPayload): Promise<UserDocument | null> {
    return this.usersService.findById(payload.sub);
  }

  private parseExpiresToMs(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }
    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return amount * (multipliers[unit] || multipliers.d);
  }
}
