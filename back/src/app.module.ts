import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Importation des modules du projet
import { UsersModule } from './users/users.module';
import { UserCardsModule } from './user-cards/user-cards.module';
import { BundlesModule } from './bundles/bundles.module';
import { CardsModule } from './cards/cards.module';
import { CardsModule } from './cards/cards.module';
import { BundlesModule } from './bundles/bundles.module';

// Importation des entités
import { User } from './users/users.entity';
import { Card } from './cards/cards.entity';
import { UserCard } from './user-cards/user-cards.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Chargement des variables d'environnement depuis `.env`
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Connexion à la base de données MySQL via TypeORM
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'kidcity',
      entities: [User, Card, UserCard], // Ajout des entités
      synchronize: true, // ⚠️ À désactiver en production pour éviter la perte de données
    }),

    // Ajout des modules du projet
    UsersModule,
    CardsModule,
    BundlesModule,
    UserCardsModule,
  ],
})
export class AppModule {}


