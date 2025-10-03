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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
const config_1 = require("@nestjs/config");
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
const jwt_1 = require("@nestjs/jwt");
const bcryptjs_1 = require("bcryptjs");
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
const users_service_1 = require("../users/users.service");
const HASH_SALT_ROUNDS = 12;
let AuthService = class AuthService {
    constructor(usersService, jwtService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(dto) {
        const existing = await this.usersService.findByEmail(dto.email);
        if (existing !== undefined) {
            throw new common_1.ConflictException("邮箱已被注册");
        }
        const passwordHash = await (0, bcryptjs_1.hash)(dto.password, HASH_SALT_ROUNDS);
        const user = await this.usersService.createUser({
            displayName: dto.displayName,
            email: dto.email,
            passwordHash,
        });
        return this.buildAuthResult(user);
    }
    async login(dto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (user === undefined) {
            throw new common_1.UnauthorizedException("邮箱或密码不正确");
        }
        const isPasswordValid = await (0, bcryptjs_1.compare)(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException("邮箱或密码不正确");
        }
        return this.buildAuthResult(user);
    }
    async buildAuthResult(user) {
        const payload = {
            displayName: user.displayName,
            email: user.email,
            sub: user.id,
        };
        const expiresIn = this.configService.get("auth.jwtExpiresIn", {
            infer: true,
        });
        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: expiresIn !== null && expiresIn !== void 0 ? expiresIn : "1h",
        });
        return {
            accessToken,
            user: this.toAuthUser(user),
        };
    }
    toAuthUser(user) {
        return {
            displayName: user.displayName,
            email: user.email,
            id: user.id,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
