import { Injectable } from "@nestjs/common";
import type { User as PrismaUser } from "@prisma/client";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { PrismaService } from "../prisma/prisma.service";
import type { CreateUserInput, User } from "./user.entity";

@Injectable()
export class UsersService {
  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  private readonly prisma: PrismaService;

  async createUser(input: CreateUserInput): Promise<User> {
    const normalizedEmail = this.normalizeEmail(input.email);
    const record = await this.prisma.user.create({
      data: {
        displayName: input.displayName,
        email: normalizedEmail,
        passwordHash: input.passwordHash,
        timezone: input.timezone,
      },
    });
    return this.toDomainUser(record);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const normalized = this.normalizeEmail(email);
    const record = await this.prisma.user.findUnique({
      where: {
        email: normalized,
      },
    });
    if (record === null) {
      return;
    }
    return this.toDomainUser(record);
  }

  async findById(id: string): Promise<User | undefined> {
    const record = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (record === null) {
      return;
    }
    return this.toDomainUser(record);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toDomainUser(record: PrismaUser): User {
    return {
      createdAt: record.createdAt,
      displayName: record.displayName,
      email: record.email,
      id: record.id,
      passwordHash: record.passwordHash,
      timezone: record.timezone ?? undefined,
      updatedAt: record.updatedAt,
    };
  }
}
