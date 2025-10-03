"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createUser(input) {
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
    async findByEmail(email) {
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
    async findById(id) {
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
    normalizeEmail(email) {
        return email.trim().toLowerCase();
    }
    toDomainUser(record) {
        var _a;
        return {
            createdAt: record.createdAt,
            displayName: record.displayName,
            email: record.email,
            id: record.id,
            passwordHash: record.passwordHash,
            timezone: (_a = record.timezone) !== null && _a !== void 0 ? _a : undefined,
            updatedAt: record.updatedAt,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
