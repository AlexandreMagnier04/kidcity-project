import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './nest/users/users.module';
import { AuthModule } from './nest/auth/auth.module';
import { CardsModule } from './nest/cards/cards.module';
import { JwtAuthGuard } from './nest/auth/decorators/public.decorator';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    CardsModule, // Ajoutez le module Cards ici
  ],
  providers: [
    // Protection globale par défaut avec JWT
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}