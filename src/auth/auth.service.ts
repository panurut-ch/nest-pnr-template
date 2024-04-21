import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entity/auth.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async login(email: string, password: string): Promise<AuthEntity> {
    const request_body = ["login", email, password]
    this.logger.log("request_body: " + request_body)
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email },
      });

      if (!user) {
        this.logger.error(`No user found for email: ${email}`);
        throw new NotFoundException(`No user found for email: ${email}`);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        this.logger.error('Invalid password');
        throw new UnauthorizedException('Invalid password');
      }
      const accessToken = this.jwtService.sign({ userId: user.id });
      this.logger.log('Access token generated: '+ accessToken);
      return {
        accessToken: accessToken,
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthEntity> {
    try {
      const decodedToken = this.jwtService.verify(refreshToken, {
        ignoreExpiration: true,
      });

      if (!decodedToken || !decodedToken.userId) {
        this.logger.error('Invalid refresh token');
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: decodedToken.userId },
      });
      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException('User not found');
      }

      return {
        accessToken: this.jwtService.sign({ userId: user.id }),
      };
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  private generateRefreshToken(userId: number): string {
    return this.jwtService.sign({ userId }, { expiresIn: '7d' });
  }
}
