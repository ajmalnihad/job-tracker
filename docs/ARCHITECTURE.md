# System Architecture

## Overview

The Smart Job Application Tracker is a full-stack web application following a client-server architecture with a clear separation between frontend and backend.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │Components│  │  Context │  │   API    │   │
│  │          │  │          │  │  (Auth)  │  │  Layer   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │             │             │         │
│         └──────────────┴─────────────┴─────────────┘         │
│                          │                                    │
└──────────────────────────┼────────────────────────────────────┘
                           │ HTTP/REST + JWT
                           │
┌──────────────────────────┼────────────────────────────────────┐
│                     Backend (Django)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Accounts  │  │  Apps    │  │ Resumes  │  │Analytics │   │
│  │   API    │  │   API    │  │   API    │  │   API    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │             │             │         │
│         └──────────────┴─────────────┴─────────────┘         │
│                          │                                    │
│                  ┌───────┴────────┐                          │
│                  │   PostgreSQL    │                          │
│                  └────────────────┘                          │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Celery Workers + Beat (Redis)                │  │
│  │    └─> Email Reminder Tasks (Scheduled Daily)       │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

## Components

### Frontend Layer

**Technology**: React 18 + Vite

**Structure**:
- **Pages**: Full-page components (Dashboard, Kanban, Applications, etc.)
- **Components**: Reusable UI components (Navbar, Card, Button, etc.)
- **Context**: Global state management (AuthContext for user auth)
- **API Layer**: Centralized Axios instance with JWT interceptors
- **Routes**: Protected route guards

**Key Features**:
- Automatic token refresh on 401 errors
- Optimistic UI updates (Kanban drag & drop)
- Responsive design with mobile-first approach
- Modern glassmorphism UI

### Backend Layer

**Technology**: Django 5.0 + Django REST Framework

**Apps**:
1. **accounts**: User authentication and profile management
2. **applications**: Job application CRUD with filtering
3. **resumes**: File upload and performance tracking
4. **analytics**: Statistics calculation service
5. **core**: Shared utilities and permissions

**Design Patterns**:
- **Service Layer**: Business logic separated (analytics/services.py)
- **ViewSets**: DRF for consistent API structure
- **Permissions**: Custom IsOwner permission for data isolation
- **Serializers**: Data validation and transformation

### Database Schema

```sql
-- Users (Django built-in)
User {
  id: integer
  username: varchar
  email: varchar
  password: varchar (hashed)
  first_name: varchar
  last_name: varchar
}

-- Resumes
Resume {
  id: integer
  user_id: foreign_key -> User
  title: varchar
  file: file_path
  uploaded_at: timestamp
}

-- Applications
Application {
  id: integer
  user_id: foreign_key -> User
  company_name: varchar
  role: varchar
  job_url: url
  status: choice [applied, hr_contacted, interview, offer, rejected]
  applied_date: date
  follow_up_date: date (nullable)
  resume_id: foreign_key -> Resume (nullable)
  notes: text
  created_at: timestamp
  updated_at: timestamp
}

Indexes:
- (user_id, status)
- (applied_date)
```

### Task Queue

**Technology**: Celery + Redis

**Tasks**:
1. `send_follow_up_reminder(application_id)`: Send email for specific application
2. `check_follow_ups()`: Daily task (9 AM) to find and queue reminders

**Configuration**:
- Beat schedule: Cron-based (daily at 9:00)
- Broker: Redis
- Result backend: Redis

## Data Flow

### Application Creation Flow
```
1. User fills form (Frontend)
2. POST /api/applications/ (API call)
3. JWT token validated (Middleware)
4. ApplicationSerializer validates data
5. ApplicationViewSet.create() saves to DB
6. Response sent back to frontend
7. UI updates with new application
```

### Kanban Drag & Drop Flow
```
1. User drags card to new column (Frontend)
2. Optimistic UI update (immediate visual feedback)
3. PATCH /api/applications/{id}/update_status/
4. Backend validates and updates status
5. On success: Keep UI change
6. On error: Revert UI and show error
```

### Token Refresh Flow
```
1. Access token expires
2. API call returns 401
3. Axios interceptor catches error
4. POST /api/auth/refresh/ with refresh token
5. New access token received
6. Original request retried with new token
7. If refresh fails: Redirect to login
```

## Security Architecture

### Authentication
- **JWT Tokens**: Access (60 min) + Refresh (7 days)
- **Token Blacklisting**: On logout
- **Password Hashing**: Django's PBKDF2

### Authorization
- **User Isolation**: All queries filtered by user_id
- **Custom Permissions**: IsOwner checks object ownership
- **Protected Routes**: Frontend route guards

### File Security
- **Type Validation**: PDF only
- **Size Limit**: 5MB max
- **Storage**: Organized by user and date

### API Security
- **CORS**: Configured allowed origins
- **CSRF**: Disabled for JWT (stateless)
- **Rate Limiting**: Can be added with DRF throttling

## Scalability Considerations

### Horizontal Scaling
- Stateless backend (JWT tokens)
- Session-less design
- Worker processes can be scaled independently

### Database Optimization
- Indexed foreign keys
- Compound indexes on common queries
- Pagination on list endpoints (50 items/page)

### Caching Opportunities
- Analytics results (can cache for 5-10 minutes)
- Resume performance metrics
- Redis for session/cache storage

### Performance
- Lazy loading of images
- Code splitting in React
- Gunicorn with multiple workers
- Static file serving via CDN (production)

## Deployment Architecture

### Production Setup

```
┌─────────────┐
│   Vercel    │  <- Frontend (Static files)
│  (Frontend) │
└──────┬──────┘
       │ API Calls
       │
┌──────▼──────┐
│   Render    │  <- Backend + Celery Workers
│  (Backend)  │
└──────┬──────┘
       │
       ├─────────┐
       │         │
┌──────▼──────┐ │
│  PostgreSQL │ │
│  (Database) │ │
└─────────────┘ │
                │
         ┌──────▼──────┐
         │    Redis    │
         │  (Cache +   │
         │   Celery)   │
         └─────────────┘
```

### Environment Variables
- Separate `.env` files for dev/prod
- Secrets stored in platform's env vars
- No hardcoded credentials

## Monitoring & Logging

### Recommended Tools
- **Backend**: Django logging + Sentry
- **Frontend**: Error boundaries + Sentry
- **Database**: pg_stat_statements
- **Celery**: Flower for task monitoring

### Key Metrics
- API response times
- Error rates (4xx, 5xx)
- Database query performance
- Task queue length
- User registration/login rates
