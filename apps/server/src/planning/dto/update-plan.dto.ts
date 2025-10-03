import { IsDateString, IsOptional, IsString } from "class-validator";

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  readonly title?: string;

  @IsOptional()
  @IsString()
  readonly focus?: string;

  @IsOptional()
  @IsDateString()
  readonly dueDate?: string;

  @IsOptional()
  @IsString()
  readonly status?: string;
}
