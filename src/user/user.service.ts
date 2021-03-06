import { Injectable, BadRequestException } from '@nestjs/common';

import { PrismaService } from '../services/prisma.service';

import { Track as trackModel } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(): Promise<object[]> {
    return await this.prisma.user.findMany({
      select: { id: true, username: true, email: true },
    });
  }

  async addToFavourite(data): Promise<object | BadRequestException> {
    const { trackId, userId } = data;

    const User = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!User) {
      return new BadRequestException('User not found');
    }

    const Track = await this.prisma.track.findUnique({
      where: { id: trackId },
    });

    if (!Track) {
      return new BadRequestException('Track not found');
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: { myFavoriteMusics: { connect: { id: Track.id } } },
    });
  }

  async getMyFavouriteMusics(id: string): Promise<object> {
    return await this.prisma.user.findUnique({
      where: { id },
      select: { myFavoriteMusics: true, username: true },
    });
  }

  async deleteAtFavourite(data): Promise<trackModel | BadRequestException> {
    const { trackId, userId } = data;

    const User = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { myFavoriteMusics: true },
    });

    if (!User) {
      return new BadRequestException('User not found');
    }

    const findTrack = User.myFavoriteMusics.find(
      (track) => track.id === trackId,
    );

    if (!findTrack) {
      return new BadRequestException('Track not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { myFavoriteMusics: { delete: { id: trackId } } },
    });

    return findTrack;
  }
}
