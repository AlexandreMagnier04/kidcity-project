import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserData } from '../users/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<UserData, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: UserData) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
    });

    // Stocker le hachage du refreshToken en base de données
    await this.usersService.setRefreshToken(user.id as number, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Accès refusé');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Accès refusé');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
    });

    await this.usersService.setRefreshToken(user.id as number, newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async register(userData: UserData) {
    if (!userData.password) {
      throw new Error('Password is required');
    }
    return this.usersService.create({
      email: userData.email,
      password: userData.password,
      name: userData.name,
      surname: userData.surname,
    });
  }

  async logout(userId: number) {
    return this.usersService.removeRefreshToken(userId);
  }
}
