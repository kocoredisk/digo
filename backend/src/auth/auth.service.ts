import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../entities/user.entity';

const ALLOWED_EMAILS = new Set([
  'coreanhope96@gmail.com',
  'joolee818@gmail.com',
  'lsyfamily64@gmail.com',
  'codlf22@gmail.com',
  'hrunj1230@gmail.com',
  'wwwbomnal@gmail.com',
  'kocoredisk@gmail.com',
]);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
    );
  }

  async googleLogin(code: string, redirectUri?: string, userAgent?: string, ipAddress?: string) {
    try {
      const finalRedirectUri = redirectUri || 'postmessage';
      const { tokens } = await this.googleClient.getToken({ code, redirect_uri: finalRedirectUri });

      if (!tokens.id_token) throw new Error('ID 토큰을 받지 못했습니다.');

      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload?.email) throw new Error('유효하지 않은 Google 토큰입니다.');

      const { email, name, sub } = payload;

      if (!ALLOWED_EMAILS.has(email)) {
        throw new UnauthorizedException('회원이 아닙니다.');
      }

      let user = await this.userRepository.findOne({ where: { provider: 'google', provider_id: sub } });

      if (!user) {
        user = await this.userRepository.findOne({ where: { email } });
        if (user) {
          user.provider = 'google';
          user.provider_id = sub;
          await this.userRepository.save(user);
        } else {
          user = this.userRepository.create({ email, name, provider: 'google', provider_id: sub });
          await this.userRepository.save(user);
        }
      }

      return {
        user: { id: user.id, email: user.email, name: user.name },
        accessToken: this.generateAccessToken(user),
        refreshToken: this.generateRefreshToken(user),
      };
    } catch (error) {
      this.logger.error('[Google Login Error]:', error);
      throw new UnauthorizedException('Google 로그인 실패');
    }
  }

  generateAccessToken(user: User): string {
    return this.jwtService.sign(
      { userId: user.id, email: user.email, sessionVersion: user.sessionVersion },
      { expiresIn: '24h' },
    );
  }

  generateRefreshToken(user: User): string {
    return this.jwtService.sign(
      { userId: user.id, tokenType: 'refresh', sessionVersion: user.sessionVersion },
      { expiresIn: '30d' },
    );
  }

  generateKingdeskToken(user: User): string {
    return this.jwtService.sign(
      { userId: user.id, email: user.email, sessionVersion: user.sessionVersion, tokenType: 'kingdesk' },
      { expiresIn: '100y' },
    );
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      if (payload.tokenType !== 'refresh') throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');

      const user = await this.userRepository.findOne({ where: { id: payload.userId } });
      if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다.');

      if (payload.sessionVersion !== undefined && user.sessionVersion !== payload.sessionVersion) {
        throw new UnauthorizedException('세션이 만료되었습니다.');
      }

      return {
        accessToken: this.generateAccessToken(user),
        refreshToken: this.generateRefreshToken(user),
        user: { id: user.id, email: user.email, name: user.name },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('리프레시 토큰이 만료되었습니다.');
    }
  }

  async getUserFromToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.tokenType === 'ws') throw new UnauthorizedException('WS 전용 토큰입니다.');

      const user = await this.userRepository.findOne({ where: { id: payload.userId } });
      if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다.');

      if (payload.tokenType !== 'kingdesk' && user.sessionVersion !== payload.sessionVersion) {
        throw new UnauthorizedException('세션이 만료되었습니다.');
      }

      return user;
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }
}
