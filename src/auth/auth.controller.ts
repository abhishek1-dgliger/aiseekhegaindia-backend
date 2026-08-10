import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserDocument } from '../users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Passport redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as UserDocument;
    const token = this.authService.signToken(user);
    this.authService.setAuthCookie(res, token);

    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const redirectBase =
      frontendUrl.split(',').map((origin) => origin.trim()).find(Boolean) ||
      'http://localhost:3000';
    const redirectUrl = new URL(redirectBase);
    redirectUrl.searchParams.set('auth', 'success');
    return res.redirect(redirectUrl.toString());
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request) {
    const user = req.user as UserDocument;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    this.authService.clearAuthCookie(res);
    return { ok: true };
  }
}
