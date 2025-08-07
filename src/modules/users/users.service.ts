import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.users.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.users.findUnique({
      where: { id },
    });
  }

  async findMany() {
    return this.prisma.users.findMany();
  }

  async create(data: Prisma.UsersCreateInput) {
    return this.prisma.users.create({
      data,
    });
  }
}
