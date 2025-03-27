import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.card.findMany({
      include: {
        attributes: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.card.findUnique({
      where: { id },
      include: {
        attributes: true,
      },
    });
  }

  async findUserCards(userId: number) {
    return this.prisma.card.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        attributes: true,
      },
    });
  }

  async addCardToUser(userId: number, cardId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        cards: {
          connect: { id: cardId },
        },
      },
      include: {
        cards: true,
      },
    });
  }

  async removeCardFromUser(userId: number, cardId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        cards: {
          disconnect: { id: cardId },
        },
      },
    });
  }

  // Admin methods
  async create(data: any) {
    return this.prisma.card.create({
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
        attributes: {
          connect: data.attributes.map(attrId => ({ id: attrId })),
        },
      },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.card.update({
      where: { id },
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
        attributes: {
          set: [],
          connect: data.attributes?.map(attrId => ({ id: attrId })),
        },
      },
    });
  }

  async remove(id: number) {
    return this.prisma.card.delete({
      where: { id },
    });
  }
}