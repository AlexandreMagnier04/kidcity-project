import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserData } from '../users/interfaces/user.interface';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordMatching = user.password
      ? await bcrypt.compare(password, user.password)
      : false;

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

    console.log('userdata', userData);
    const newUser = {
      email: userData.email,
      password: userData.password,
      name: userData.name,
      surname: userData.surname,
    };

    return await this.usersService.create(newUser);
  }

  async logout(userId: number) {
    return this.usersService.removeRefreshToken(userId);
  }
}
