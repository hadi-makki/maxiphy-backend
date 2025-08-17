# Maxiphy Backend - NestJS Todo API

A robust REST API backend for the todo application built with NestJS, featuring authentication, database management, and comprehensive todo operations.

## 🛠 Tech Stack

- **NestJS** - Node.js framework with TypeScript
- **Prisma** - Database ORM with type safety
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Class Validator** - Input validation and transformation
- **Passport** - Authentication middleware

## 📁 Project Structure

```
maxiphy-backend/
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── guards/          # JWT guards
│   │   ├── strategies/      # Passport strategies
│   │   └── decorators/      # Custom decorators
│   ├── todos/               # Todos module
│   │   ├── todos.controller.ts
│   │   ├── todos.service.ts
│   │   └── dto/            # Todo DTOs
│   ├── prisma/             # Database service
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── app.module.ts       # Main application module
│   └── main.ts            # Application entry point
├── prisma/                 # Database schema and migrations
    ├── schema.prisma      # Database schema
    └── migrations/        # Database migrations

```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation & Setup

1. **Install dependencies**

   ```bash
   yarn install
   ```

2. **Setup PostgreSQL database**

   ```bash
   # Create database
   sudo -u postgres psql -c "CREATE DATABASE todoapp;"

   # Create user (optional - you can use postgres user)
   sudo -u postgres psql -c "CREATE USER todouser WITH ENCRYPTED PASSWORD 'todopass';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE todoapp TO todouser;"
   ```

3. **Configure environment variables**

   ```bash
   # Copy and edit .env file
   cp .env.example .env
   ```

   Edit `.env`:

   ```env
   DATABASE_URL="postgresql://postgres:@localhost:5432/todoapp?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   PORT=3001
   NODE_ENV="development"
   ```

4. **Run database migrations**

   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start the development server**
   ```bash
   yarn start:dev
   ```

The backend will be running at `http://localhost:3001`

## 🔧 API Routes

### Authentication Endpoints

- `POST /api/auth/register` - Register new user

  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```

- `POST /api/auth/login` - Login user

  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/logout` - Logout user (clears HTTP-only cookie)

- `GET /api/auth/me` - Get current user profile (requires authentication)

### Todo Endpoints

All todo endpoints require authentication via JWT token.

- `GET /api/todos` - Get user's todos with optional query parameters
- `POST /api/todos` - Create new todo
- `GET /api/todos/:id` - Get specific todo
- `PATCH /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `GET /api/todos/stats` - Get todo statistics

### Query Parameters for GET /api/todos

- `priority` - Filter by priority (LOW, MEDIUM, HIGH)
- `completed` - Filter by completion status (true/false)
- `search` - Search in description (case-insensitive)
- `sortBy` - Sort by field (priority, date, createdAt)
- `sortOrder` - Sort order (asc, desc)
- `page` - Page number for pagination (default: 1)
- `limit` - Items per page (default: 10)

### Todo Data Model

```typescript
interface Todo {
  id: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  completed: boolean;
  pinned: boolean;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
```

## 🧪 Testing

### Running Tests

```bash
# Unit tests
yarn test
```

### Test Files

- `src/auth/auth.service.spec.ts` - Authentication service tests
- `src/todos/todos.service.spec.ts` - Todo service tests
- `test/app.e2e-spec.ts` - End-to-end API tests

## 🔒 Security Features

### Authentication & Authorization

- **JWT Tokens** - Secure authentication with HTTP-only cookies
- **Password Hashing** - bcryptjs with salt rounds
- **User Isolation** - Users can only access their own todos
- **Guards** - Route protection with custom JWT guards

### Input Validation

- **Class Validator** - DTO validation with decorators
- **Prisma Types** - Database-level type safety
- **SQL Injection Protection** - Prisma ORM prevents SQL injection

### Security Headers & CORS

```typescript
// main.ts security configuration
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```

## 🗄️ Database Schema

### User Table

```sql
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  todos     Todo[]
}
```

### Todo Table

```sql
model Todo {
  id          String    @id @default(cuid())
  description String
  priority    Priority  @default(MEDIUM)
  completed   Boolean   @default(false)
  pinned      Boolean   @default(false)
  date        DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 📊 API Performance

### Optimization Features

- **Database Indexing** - Indexed fields for faster queries
- **Pagination** - Efficient data retrieval for large datasets
- **Query Optimization** - Selective field loading with Prisma
- **Input Validation** - Early request validation to reduce processing

### Monitoring

- Request/response logging in development
- Error tracking and stack traces
- Performance metrics can be added with monitoring tools

## 🚀 Deployment

### Environment Setup

For production deployment, ensure these environment variables are set:

```env
NODE_ENV=production
DATABASE_URL="your-production-database-url"
JWT_SECRET="strong-production-secret"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="https://your-frontend-domain.com"
```

### Database Migration

```bash
# Production migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Docker Support (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

## 🔧 Development

### Code Quality

- **TypeScript** - Full type safety
- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality checks (can be added)

### Architecture Patterns

- **Module-based Architecture** - Organized by feature modules
- **Dependency Injection** - NestJS built-in DI container
- **Guard-based Security** - Route-level protection
- **DTO Pattern** - Input/output data transformation
- **Service Layer** - Business logic separation

### Adding New Features

1. Create a new module: `nest g module feature-name`
2. Generate service: `nest g service feature-name`
3. Generate controller: `nest g controller feature-name`
4. Add DTOs for validation
5. Write tests for new functionality

## 📈 Monitoring & Logging

### Logging

```typescript
// Built-in NestJS logger
import { Logger } from '@nestjs/common';

@Injectable()
export class YourService {
  private readonly logger = new Logger(YourService.name);

  someMethod() {
    this.logger.log('Operation completed');
    this.logger.error('Something went wrong');
  }
}
```

### Health Checks

Add health check endpoint:

```bash
npm install @nestjs/terminus
```

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Write tests for new features
3. Update documentation
4. Ensure all tests pass before submitting PRs

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Built with ❤️ for Maxiphy Assessment**
