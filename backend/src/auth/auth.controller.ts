import { Controller, Post, Get, Body, Res, Req, Query, HttpStatus } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';

const COOKIE_BASE = (prod: boolean) => ({
  httpOnly: true,
  secure: prod,
  sameSite: 'strict' as const,
  path: '/',
});

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google-direct')
  async googleDirect(
    @Query('callback') callback: string,
    @Query('prompt') prompt: string,
    @Res() res: Response,
  ) {
    const prod = process.env.NODE_ENV === 'production';
    if (callback) {
      res.cookie('digo_callback', callback, {
        httpOnly: false,
        secure: prod,
        sameSite: 'lax',
        maxAge: 300000,
        path: '/',
      });
    }

    const redirectUri = prod
      ? 'https://digo.kr/auth/google/callback'
      : 'http://localhost:3003/auth/google/callback';

    let url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile`;
    if (prompt) url += `&prompt=${prompt}`;

    return res.redirect(url);
  }

  @Post('google-code')
  async googleCode(@Body('code') code: string, @Body('redirect_uri') redirectUri: string, @Req() req: Request, @Res() res: Response) {
    try {
      if (!code) return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: '인증 코드가 없습니다.' });

      const prod = process.env.NODE_ENV === 'production';
      const result = await this.authService.googleLogin(code, redirectUri, req.headers['user-agent'], req.ip);

      res.cookie('accessToken', result.accessToken, { ...COOKIE_BASE(prod), maxAge: 86400000 });
      res.cookie('refreshToken', result.refreshToken, { ...COOKIE_BASE(prod), maxAge: 2592000000 });

      return res.status(HttpStatus.OK).json({ success: true, data: { user: result.user } });
    } catch (error) {
      const message = error?.response?.message || error?.message || 'Google 로그인 실패';
      return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, error: message });
    }
  }

  @Get('me')
  async getMe(@Req() req: Request, @Res() res: Response) {
    try {
      const prod = process.env.NODE_ENV === 'production';
      const authHeader = req.headers?.authorization;
      const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.cookies?.accessToken;

      if (!accessToken) return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, error: '인증이 필요합니다.' });

      const user = await this.authService.getUserFromToken(accessToken);
      const newToken = this.authService.generateAccessToken(user);

      res.cookie('accessToken', newToken, { ...COOKIE_BASE(prod), maxAge: 86400000 });

      return res.status(HttpStatus.OK).json({
        success: true,
        data: { user: { id: user.id, email: user.email, name: user.name, nickname: user.nickname ?? null, profileAvatar: user.profileAvatar ?? null } },
      });
    } catch {
      return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, error: '유효하지 않은 토큰입니다.' });
    }
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    try {
      const prod = process.env.NODE_ENV === 'production';
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, error: '리프레시 토큰이 없습니다.' });

      const result = await this.authService.refreshTokens(refreshToken);
      res.cookie('accessToken', result.accessToken, { ...COOKIE_BASE(prod), maxAge: 86400000 });
      res.cookie('refreshToken', result.refreshToken, { ...COOKIE_BASE(prod), maxAge: 2592000000 });

      return res.status(HttpStatus.OK).json({ success: true, data: { user: result.user } });
    } catch {
      const prod = process.env.NODE_ENV === 'production';
      res.clearCookie('accessToken', { ...COOKIE_BASE(prod) });
      res.clearCookie('refreshToken', { ...COOKIE_BASE(prod) });
      return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, error: '토큰 갱신 실패' });
    }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const prod = process.env.NODE_ENV === 'production';
    res.clearCookie('accessToken', { ...COOKIE_BASE(prod) });
    res.clearCookie('refreshToken', { ...COOKIE_BASE(prod) });
    return res.status(HttpStatus.OK).json({ success: true, message: '로그아웃 완료' });
  }

  @Post('kingdesk-token')
  async getKingdeskToken(@Req() req: Request, @Res() res: Response) {
    try {
      const accessToken = req.cookies?.accessToken;
      if (!accessToken) return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, error: '인증이 필요합니다.' });

      const user = await this.authService.getUserFromToken(accessToken);
      const kingdeskToken = this.authService.generateKingdeskToken(user);

      return res.status(HttpStatus.OK).json({ success: true, token: kingdeskToken });
    } catch {
      return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, error: '토큰 발급 실패' });
    }
  }
}
