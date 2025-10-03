import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { ConfigService } from "@nestjs/config";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcryptjs";
import type { AppConfig } from "../types";
import type { User } from "../users/user.entity";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { UsersService } from "../users/users.service";
import type { AuthResult, AuthUser, JwtPayload } from "./auth.types";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterDto } from "./dto/register.dto";

const HASH_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    usersService: UsersService,
    jwtService: JwtService,
    configService: ConfigService<AppConfig>
  ) {
    this.usersService = usersService;
    this.jwtService = jwtService;
    this.configService = configService;
  }

  private readonly configService: ConfigService<AppConfig>;

  private readonly jwtService: JwtService;

  private readonly usersService: UsersService;

  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing !== undefined) {
      throw new ConflictException("邮箱已被注册");
    }

    const passwordHash = await hash(dto.password, HASH_SALT_ROUNDS);
    const user = await this.usersService.createUser({
      displayName: dto.displayName,
      email: dto.email,
      passwordHash,
    });

    return this.buildAuthResult(user);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email);
    if (user === undefined) {
      throw new UnauthorizedException("邮箱或密码不正确");
    }

    const isPasswordValid = await compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("邮箱或密码不正确");
    }

    return this.buildAuthResult(user);
  }

  private async buildAuthResult(user: User): Promise<AuthResult> {
    const payload: JwtPayload = {
      displayName: user.displayName,
      email: user.email,
      sub: user.id,
    };
    const expiresIn = this.configService.get<string>("auth.jwtExpiresIn", {
      infer: true,
    });
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: expiresIn ?? "1h",
    });

    return {
      accessToken,
      user: this.toAuthUser(user),
    };
  }

  private toAuthUser(user: User): AuthUser {
    return {
      displayName: user.displayName,
      email: user.email,
      id: user.id,
    };
  }
}
