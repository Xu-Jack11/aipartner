import { IsDateString, IsOptional, IsString } from "class-validator";

export class CreatePlanDto {
  @IsString()
  readonly title!: string;

  @IsString()
  readonly focus!: string;

  @IsOptional()
  @IsString()
  readonly sessionId?: string;

  @IsOptional()
  @IsDateString()
  readonly dueDate?: string;
}
