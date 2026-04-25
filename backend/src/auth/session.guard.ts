import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const accessToken =
      this.extractTokenFromHeader(request) ||
      request.cookies?.accessToken;

    if (!accessToken) {
      throw new UnauthorizedException('인증이 필요합니다.');
    }

    try {
      const user = await this.authService.getUserFromToken(accessToken);
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  private extractTokenFromHeader(request: any): string | null {
    const authorization = request.headers?.authorization;
    if (authorization?.startsWith('Bearer ')) {
      return authorization.substring(7);
    }
    return null;
  }
}
