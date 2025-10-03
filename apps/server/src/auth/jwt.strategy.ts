import { Injectable, UnauthorizedException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { AppConfig } from "../types";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { UsersService } from "../users/users.service";
import type { AuthUser, JwtPayload } from "./auth.types";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService<AppConfig>,
    usersService: UsersService
  ) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>("auth.jwtSecret", {
        infer: true,
      }),
    });
    this.usersService = usersService;
  }

  private readonly usersService: UsersService;

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.usersService.findById(payload.sub);
    if (user === undefined) {
      throw new UnauthorizedException("用户不存在或已被删除");
    }
    return {
      displayName: user.displayName,
      email: user.email,
      id: user.id,
    };
  }
}
