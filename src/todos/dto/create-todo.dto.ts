import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Priority } from '@prisma/client';

export class CreateTodoDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsEnum(Priority)
  priority: Priority;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}
