import { Injectable, ConflictException } from '@nestjs/common';
import { Role, User } from '@prisma/client';

import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

// Interface pour remplacer le type User manquant de Prisma
export interface UserData {
  id?: number;
  email: string;
  name: string;
  surname: string;
  password?: string;
  role?: Role;
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number){
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string){
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: UserData) {
    // Vérifier si l'utilisateur existe déjà
    // const existingUser = await this.findByEmail(data.email);
    // if (existingUser) {
    //   throw new ConflictException('Cet email est déjà utilisé');
    // }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(data.password as string, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        surname: data.surname,
        password: hashedPassword,
        role: data.role || Role.USER,
      },
    });

    // Ne pas retourner le mot de passe
    const { password, ...result } = user;
    return result;
  }

  async setRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  async removeRefreshToken(userId: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async update(id: number, data: User) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
