import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createTodoDto: CreateTodoDto) {
    return this.todosService.create(user.id, createTodoDto);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: QueryTodoDto) {
    return this.todosService.findAll(user.id, query);
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.todosService.getStats(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.todosService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todosService.update(id, user.id, updateTodoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.todosService.remove(id, user.id);
  }
}
