import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
// biome-ignore lint/style/useImportType: NestJS dependency injection requires runtime metadata.
import { AuthService } from "./auth.service";
import type { AuthResult, AuthUser } from "./auth.types";
// biome-ignore lint/style/useImportType: ValidationPipe requires class metadata at runtime.
import { LoginDto } from "./dto/login.dto";
// biome-ignore lint/style/useImportType: ValidationPipe requires class metadata at runtime.
import { RegisterDto } from "./dto/register.dto";

@Controller({ path: "auth", version: "1" })
export class AuthController {
  constructor(authService: AuthService) {
    this.authService = authService;
  }

  private readonly authService: AuthService;

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto): Promise<AuthResult> {
    return this.authService.register(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<AuthResult> {
    return this.authService.login(dto);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  profile(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }
}
