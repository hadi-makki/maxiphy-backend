import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TodosService } from './todos.service';
import { PrismaService } from '../prisma/prisma.service';
import { Priority } from '@prisma/client';

describe('TodosService', () => {
  let service: TodosService;
  let prismaService: PrismaService;

  const mockTodo = {
    id: '1',
    description: 'Test todo',
    priority: Priority.MEDIUM,
    date: new Date(),
    completed: false,
    pinned: false,
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    todo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createTodoDto = {
      description: 'Test todo',
      priority: Priority.MEDIUM,
      date: '2024-01-01',
      pinned: false,
    };

    it('should create a todo successfully', async () => {
      mockPrismaService.todo.create.mockResolvedValue(mockTodo);

      const result = await service.create('user1', createTodoDto);

      expect(mockPrismaService.todo.create).toHaveBeenCalledWith({
        data: {
          ...createTodoDto,
          date: new Date(createTodoDto.date),
          userId: 'user1',
        },
      });
      expect(result).toEqual(mockTodo);
    });
  });

  describe('findAll', () => {
    it('should return todos with pagination', async () => {
      const mockTodos = [mockTodo];
      mockPrismaService.todo.findMany.mockResolvedValue(mockTodos);
      mockPrismaService.todo.count.mockResolvedValue(1);

      const result = await service.findAll('user1', {});

      expect(result).toEqual({
        todos: mockTodos,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          pages: 1,
        },
      });
    });

    it('should filter by completed status', async () => {
      const mockTodos = [mockTodo];
      mockPrismaService.todo.findMany.mockResolvedValue(mockTodos);
      mockPrismaService.todo.count.mockResolvedValue(1);

      await service.findAll('user1', { completed: true });

      expect(mockPrismaService.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            completed: true,
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a todo if found', async () => {
      mockPrismaService.todo.findFirst.mockResolvedValue(mockTodo);

      const result = await service.findOne('1', 'user1');

      expect(mockPrismaService.todo.findFirst).toHaveBeenCalledWith({
        where: {
          id: '1',
          userId: 'user1',
        },
      });
      expect(result).toEqual(mockTodo);
    });

    it('should throw NotFoundException if todo not found', async () => {
      mockPrismaService.todo.findFirst.mockResolvedValue(null);

      await expect(service.findOne('1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateTodoDto = {
      description: 'Updated todo',
      completed: true,
    };

    it('should update a todo successfully', async () => {
      const updatedTodo = { ...mockTodo, ...updateTodoDto };
      mockPrismaService.todo.findFirst.mockResolvedValue(mockTodo);
      mockPrismaService.todo.update.mockResolvedValue(updatedTodo);

      const result = await service.update('1', 'user1', updateTodoDto);

      expect(mockPrismaService.todo.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateTodoDto,
      });
      expect(result).toEqual(updatedTodo);
    });

    it('should throw NotFoundException if todo not found', async () => {
      mockPrismaService.todo.findFirst.mockResolvedValue(null);

      await expect(service.update('1', 'user1', updateTodoDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a todo successfully', async () => {
      mockPrismaService.todo.findFirst.mockResolvedValue(mockTodo);
      mockPrismaService.todo.delete.mockResolvedValue(mockTodo);

      const result = await service.remove('1', 'user1');

      expect(mockPrismaService.todo.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual({
        success: true,
        message: 'Todo deleted successfully',
      });
    });

    it('should throw NotFoundException if todo not found', async () => {
      mockPrismaService.todo.findFirst.mockResolvedValue(null);

      await expect(service.remove('1', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStats', () => {
    it('should return todo statistics', async () => {
      mockPrismaService.todo.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(5) // completed
        .mockResolvedValueOnce(5) // pending
        .mockResolvedValueOnce(2) // high
        .mockResolvedValueOnce(3) // medium
        .mockResolvedValueOnce(5); // low

      const result = await service.getStats('user1');

      expect(result).toEqual({
        total: 10,
        completed: 5,
        pending: 5,
        byPriority: {
          high: 2,
          medium: 3,
          low: 5,
        },
      });
    });
  });
});
