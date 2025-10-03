import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

class GenerateTaskDto {
  @IsString()
  summary!: string;

  @IsOptional()
  @IsString()
  dueDate?: string;
}

export class GeneratePlanDto {
  @IsString()
  readonly sessionId!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GenerateTaskDto)
  readonly taskSuggestions?: GenerateTaskDto[];
}
