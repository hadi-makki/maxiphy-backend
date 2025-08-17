import {
  IsOptional,
  IsEnum,
  IsString,
  IsBoolean,
  IsNumberString,
} from 'class-validator';
import { Priority } from '@prisma/client';
import { Transform } from 'class-transformer';

export class QueryTodoDto {
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  completed?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['priority', 'date', 'createdAt'])
  sortBy?: 'priority' | 'date' | 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
