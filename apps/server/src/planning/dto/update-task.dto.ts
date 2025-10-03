import { IsDateString, IsOptional, IsString } from "class-validator";

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  readonly summary?: string;

  @IsOptional()
  @IsString()
  readonly status?: string;

  @IsOptional()
  @IsDateString()
  readonly dueDate?: string;

  @IsOptional()
  @IsDateString()
  readonly completedAt?: string;
}
