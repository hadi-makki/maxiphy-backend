import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Priority } from '@prisma/client';

export class UpdateTodoDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}
