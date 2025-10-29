# Uniglaze Project Management System

## Project Overview

A comprehensive construction project management web application built for Uniglaze (glasswork & construction services) to streamline project tracking, reporting, and team communication.

## Technology Stack

### Core Framework

- **Next.js 15.2.3** - React framework with App Router
- **React 19.1.0** - Frontend library
- **TypeScript 5.8.2** - Type safety
- **Tailwind CSS 4.0.15** - Styling framework

### Backend & Database

- **tRPC 11.0.0** - Type-safe API layer
- **Prisma 6.5.0** - Database ORM
- **PostgreSQL** - Primary database
- **Better Auth 1.2.12** - Authentication system

### UI Components

- **Radix UI** - Headless UI components (accordion, dialog, dropdown, etc.)
- **Lucide React** - Icon library
- **React Hook Form 7.62.0** - Form management
- **Zod 4.0.14** - Schema validation

### File Storage & Media

- **AWS S3** - Image and document storage
- **@aws-sdk/client-s3** - S3 integration
- **@react-pdf/renderer** - PDF generation

### Email & Communication

- **Nodemailer 7.0.5** - SMTP email service
- **@react-email/components** - Email templates
- **Microsoft Teams** - Integration for notifications

### State Management & Utilities

- **Zustand 5.0.6** - State management
- **TanStack Query 5.69.0** - Server state management
- **TanStack Table 8.21.3** - Data tables
- **Date-fns 4.1.0** - Date utilities
- **Recharts 2.15.4** - Data visualization

## Integrations List

### External Services

1. **AWS S3** - File storage for images and documents
2. **SMTP Email Service** - Automated email notifications
3. **Microsoft Teams** - Project communication and notifications
4. **PostgreSQL Database** - Data persistence

### Internal Integrations

1. **Better Auth** - User authentication and session management
2. **Prisma** - Database operations and migrations
3. **tRPC** - Type-safe API communication
4. **React Email** - Email template rendering

## How to Start the Project

### Prerequisites

- **Bun** (package manager)
- **Docker** or **Podman** (for database)
- **Node.js 20+** (if not using Bun)

### Environment Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Configure required environment variables:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/uniglaze"

# AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="your-bucket-name"

# SMTP Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="your-email@gmail.com"

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:4000"
```

### Development Commands

#### Start Development Server

```bash
bun run dev
```

This command will:

- Start PostgreSQL database container
- Run database migrations
- Seed the database
- Start Prisma Studio
- Launch Next.js dev server on port 4000

#### Database Commands

```bash
# Generate Prisma client
bun run db:generate

# Push schema changes
bun run db:push

# Reset database (deploy)
bun run db:push:deploy

# Seed database
bun run db:seed

# Open Prisma Studio
bun run db:studio
```

#### Other Commands

```bash
# Build for production
bun run build

# Start production server
bun run start

# Lint code
bun run lint

# Format code
bun run format:write

# Type check
bun run typecheck
```

## Integration Ownership

### Your Integrations (Custom Built)

1. **AWS S3 Integration** - Custom implementation for file uploads and storage
2. **Email System** - Custom SMTP integration with React Email templates
3. **Microsoft Teams Integration** - Custom webhook integration for notifications
4. **PDF Report Generation** - Custom PDF generation using @react-pdf/renderer
5. **Role-based Authentication** - Custom implementation using Better Auth
6. **Project Management Workflow** - Custom business logic for construction projects

### Given by Uniglaze

1. **AWS S3 Credentials** - Access keys and bucket configuration
2. **SMTP Email Credentials** - Email service configuration
3. **Microsoft Teams Webhook URLs** - For project notifications
4. **Business Requirements** - Project specifications and workflow requirements

## Deployment Instructions

### Vercel Deployment (Recommended)

1. **Connect Repository**:
   - Link your GitHub repository to Vercel
   - Configure build settings

2. **Environment Variables**:
   - Add all required environment variables in Vercel dashboard
   - Ensure production database URL is configured

3. **Build Configuration**:

   ```json
   {
     "buildCommand": "bun run vercel-build",
     "outputDirectory": ".next"
   }
   ```

4. **Deploy**:
   ```bash
   # Vercel will automatically deploy on push to main branch
   git push origin main
   ```

### Docker Deployment

1. **Create Dockerfile**:

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json bun.lock ./
RUN npm install -g bun
RUN bun install

FROM base AS deps
COPY . .
RUN bun run build

FROM base AS runner
WORKDIR /app
COPY --from=deps /app/.next ./.next
COPY --from=deps /app/public ./public
COPY --from=deps /app/package.json ./package.json

EXPOSE 3000
CMD ["bun", "start"]
```

2. **Build and Run**:

```bash
docker build -t uniglaze-app .
docker run -p 3000:3000 uniglaze-app
```

### AWS Deployment

1. **EC2 Instance Setup**:
   - Launch EC2 instance with Node.js
   - Install Bun package manager
   - Clone repository

2. **Database Setup**:
   - Use AWS RDS PostgreSQL
   - Configure security groups
   - Update DATABASE_URL

3. **S3 Configuration**:
   - Create S3 bucket
   - Configure IAM permissions
   - Update AWS credentials

4. **Deploy**:

```bash
# On EC2 instance
git clone <repository-url>
cd uniglaze
bun install
bun run build
bun run start
```

### Environment-Specific Notes

- **Development**: Uses local PostgreSQL via Docker
- **Production**: Requires production PostgreSQL database
- **File Storage**: All environments use AWS S3
- **Email**: SMTP configuration required for all environments

## User Roles & Permissions

### Managing Director (MD)

- Full system access
- User management
- Project oversight
- Report approval

### Head of Planning (HOP)

- Project creation and management
- Report approval/rejection
- Team assignment
- Client communication

### Project Manager (PM)

- Daily report submission
- Photo uploads
- Blockage reporting
- Project progress updates

## Key Features

### Project Management

- Project creation with detailed specifications
- Sheet 1: Master project data with calculations
- Sheet 2: Detailed work breakdown structure
- Real-time progress tracking

### Reporting System

- Daily progress reports
- PDF report generation
- Email distribution (client/internal)
- Microsoft Teams notifications
- Report approval workflow

### File Management

- AWS S3 integration for secure file storage
- Photo uploads with metadata
- Document management
- Archive system for historical data

### Communication

- Email notifications
- Microsoft Teams integration
- Role-based access control
- Audit trail for all actions
