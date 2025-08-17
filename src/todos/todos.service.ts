import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';
import { Priority, Prisma } from '@prisma/client';

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTodoDto: CreateTodoDto) {
    const todo = await this.prisma.todo.create({
      data: {
        ...createTodoDto,
        date: new Date(createTodoDto.date),
        userId,
      },
    });

    return todo;
  }

  async findAll(userId: string, query: QueryTodoDto) {
    const {
      priority,
      completed,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '10',
    } = query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: Prisma.TodoWhereInput = {
      userId,
    };

    if (priority) {
      where.priority = priority;
    }

    if (completed !== undefined) {
      where.completed = completed === true;
    }

    if (search) {
      where.description = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Build orderBy clause
    const orderBy: Prisma.TodoOrderByWithRelationInput = {};

    if (sortBy === 'priority') {
      // Custom priority ordering: HIGH, MEDIUM, LOW
      orderBy.priority = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Always sort pinned items first
    const todos = await this.prisma.todo.findMany({
      where,
      orderBy: [
        { pinned: 'desc' }, // Pinned items first
        orderBy,
      ],
      skip,
      take: limitNum,
    });

    // Get total count for pagination
    const total = await this.prisma.todo.count({ where });

    return {
      todos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const todo = await this.prisma.todo.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    return todo;
  }

  async update(id: string, userId: string, updateTodoDto: UpdateTodoDto) {
    // First check if todo exists and belongs to user
    await this.findOne(id, userId);

    const updateData: Prisma.TodoUpdateInput = { ...updateTodoDto };

    if (updateTodoDto.date) {
      updateData.date = new Date(updateTodoDto.date);
    }

    const todo = await this.prisma.todo.update({
      where: { id },
      data: updateData,
    });

    return todo;
  }

  async remove(id: string, userId: string) {
    // First check if todo exists and belongs to user
    await this.findOne(id, userId);

    await this.prisma.todo.delete({
      where: { id },
    });

    return { success: true, message: 'Todo deleted successfully' };
  }

  async getStats(userId: string) {
    const [total, completed, pending, high, medium, low] = await Promise.all([
      this.prisma.todo.count({ where: { userId } }),
      this.prisma.todo.count({ where: { userId, completed: true } }),
      this.prisma.todo.count({ where: { userId, completed: false } }),
      this.prisma.todo.count({ where: { userId, priority: Priority.HIGH } }),
      this.prisma.todo.count({ where: { userId, priority: Priority.MEDIUM } }),
      this.prisma.todo.count({ where: { userId, priority: Priority.LOW } }),
    ]);

    return {
      total,
      completed,
      pending,
      byPriority: {
        high,
        medium,
        low,
      },
    };
  }
}
