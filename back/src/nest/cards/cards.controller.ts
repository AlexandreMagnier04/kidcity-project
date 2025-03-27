import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CardsService } from './cards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  findAll() {
    return this.cardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/collection')
  getUserCards(@Request() req) {
    return this.cardsService.findUserCards(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('user/add/:id')
  addCardToUser(@Request() req, @Param('id') cardId: string) {
    return this.cardsService.addCardToUser(req.user.id, +cardId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('user/remove/:id')
  removeCardFromUser(@Request() req, @Param('id') cardId: string) {
    return this.cardsService.removeCardFromUser(req.user.id, +cardId);
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles()
  @Post()
  create(@Body() createCardDto: any) {
    return this.cardsService.create(createCardDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCardDto: any) {
    return this.cardsService.update(+id, updateCardDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardsService.remove(+id);
  }
}