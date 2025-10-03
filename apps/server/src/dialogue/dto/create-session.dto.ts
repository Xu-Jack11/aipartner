import { IsString, MaxLength, MinLength } from "class-validator";

const TITLE_MIN_LENGTH = 1;
const TITLE_MAX_LENGTH = 200;
const FOCUS_MIN_LENGTH = 1;
const FOCUS_MAX_LENGTH = 500;

export class CreateSessionDto {
  @IsString()
  @MinLength(TITLE_MIN_LENGTH)
  @MaxLength(TITLE_MAX_LENGTH)
  title!: string;

  @IsString()
  @MinLength(FOCUS_MIN_LENGTH)
  @MaxLength(FOCUS_MAX_LENGTH)
  focus!: string;
}
