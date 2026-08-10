import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CookieOptions, Response } from 'express';
import { UserDocument } from '../users/schemas/user.schema';
import { GoogleProfileInput, UsersService } from '../users/users.service';

export type JwtPayload = {
  sub: string;
  email: string;
};

type SameSiteOption = 'lax' | 'none' | 'strict';

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

    res.cookie(cookieName, token, {
      ...this.getCookieOptions(),
      maxAge: maxAgeMs,
    });
  }

  clearAuthCookie(res: Response): void {
    const cookieName = this.config.get<string>('COOKIE_NAME') || 'access_token';
    res.clearCookie(cookieName, this.getCookieOptions());
  }

  async getUserFromPayload(payload: JwtPayload): Promise<UserDocument | null> {
    return this.usersService.findById(payload.sub);
  }

  private getCookieOptions(): CookieOptions {
    const isProd = process.env.NODE_ENV === 'production';
    const sameSite = this.resolveSameSite(isProd);
    const secure = this.resolveSecure(isProd, sameSite);

    return {
      httpOnly: true,
      sameSite,
      secure,
      path: '/',
    };
  }

  private resolveSameSite(isProd: boolean): SameSiteOption {
    const raw = (this.config.get<string>('COOKIE_SAMESITE') || '')
      .trim()
      .toLowerCase();

    if (raw === 'lax' || raw === 'none' || raw === 'strict') {
      return raw;
    }

    // Cross-site FE↔API in production needs SameSite=None.
    return isProd ? 'none' : 'lax';
  }

  private resolveSecure(isProd: boolean, sameSite: SameSiteOption): boolean {
    const raw = (this.config.get<string>('COOKIE_SECURE') || '')
      .trim()
      .toLowerCase();

    if (raw === 'true' || raw === '1') {
      return true;
    }
    if (raw === 'false' || raw === '0') {
      return false;
    }

    // SameSite=None requires Secure; otherwise follow NODE_ENV.
    if (sameSite === 'none') {
      return true;
    }
    return isProd;
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
