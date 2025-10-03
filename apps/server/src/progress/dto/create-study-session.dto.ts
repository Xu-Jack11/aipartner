import { IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";

/**
 * 创建学习会话记录的请求DTO
 */
export class CreateStudySessionDto {
  @IsUUID()
  @IsOptional()
  sessionId?: string;

  @IsString()
  focus!: string;

  @IsInt()
  @Min(1)
  minutes!: number;

  @IsOptional()
  recordedAt?: Date;
}
