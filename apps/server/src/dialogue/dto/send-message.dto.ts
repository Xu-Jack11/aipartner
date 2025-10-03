import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

const CONTENT_MAX_LENGTH = 10_000;

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(CONTENT_MAX_LENGTH)
  content!: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tools?: string[];
}
