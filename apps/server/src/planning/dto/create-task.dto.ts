import { IsDateString, IsOptional, IsString } from "class-validator";

export class CreateTaskDto {
  @IsString()
  readonly summary!: string;

  @IsOptional()
  @IsDateString()
  readonly dueDate?: string;
}
