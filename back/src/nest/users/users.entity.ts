import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserCard } from '../user-cards/user-cards.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 1000 }) // Montant initial de Kidcoin
  kidcoins: number;

  @OneToMany(() => UserCard, (userCard) => userCard.user)
  cards: UserCard[];
}
