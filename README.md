# Smart Job Application Tracker

A production-ready, full-stack SaaS application that empowers job seekers to track applications, manage resumes, visualize progress via Kanban board, receive email reminders, and analyze application performance.

![Tech Stack](https://img.shields.io/badge/Django-5.0-green) ![React](https://img.shields.io/badge/React-18-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue) ![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## 🚀 Features

### Core Functionality
- **JWT Authentication** - Secure user registration, login, and token refresh
- **Job Application Tracking** - Complete CRUD operations with filtering by status and date
- **Kanban Board** - Drag & drop interface for visual application management
- **Resume Management** - PDF upload with file validation and performance metrics
- **Analytics Dashboard** - Real-time stats including response rate, avg response time, and status distribution
- **Email Reminders** - Automated follow-up emails via Celery scheduled tasks
- **Multi-user Support** - Secure isolation with user-based permissions

### Technical Highlights
- **Backend**: Django REST Framework with modular app structure
- **Frontend**: React + Vite with modern responsive UI
- **Database**: PostgreSQL with optimized indexes
- **Task Queue**: Celery + Redis for background jobs
- **Containerization**: Full Docker setup with docker-compose
- **Security**: JWT tokens, password hashing, CORS, file validation

## 📋 Prerequisites

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (optional but recommended)
- PostgreSQL 15+ (if running without Docker)
- Redis (if running without Docker)

## 🛠️ Installation & Setup

### Option 1: Docker (Recommended)

1. **Clone the repository**
```bash
cd "d:\projects\job tracker"
```

2. **Backend Setup**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
docker-compose up --build
```

The backend will be available at `http://localhost:8000`

3. **Frontend Setup** (in a new terminal)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Option 2: Local Development

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
cp .env.example .env
# Configure database in .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Start Celery Worker (in a new terminal):**
```bash
cd backend
venv\Scripts\activate
celery -A backend worker -l info
```

**Start Celery Beat (in a new terminal):**
```bash
cd backend
venv\Scripts\activate
celery -A backend beat -l info
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 📁 Project Structure

```
job tracker/
├── backend/                    # Django Backend
│   ├── backend/               # Project settings
│   │   ├── settings.py       # Django configuration
│   │   ├── urls.py           # URL routing
│   │   └── celery.py         # Celery config
│   ├── accounts/             # Authentication app
│   ├── applications/         # Job tracking app
│   ├── resumes/              # Resume management
│   ├── analytics/            # Analytics service
│   ├── core/                 # Shared utilities
│   ├── tasks/                # Celery tasks
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── frontend/                   # React Frontend
    ├── src/
    │   ├── api/              # API integration
    │   ├── components/       # Reusable components
    │   ├── pages/            # Page components
    │   ├── context/          # React Context (Auth)
    │   ├── hooks/            # Custom hooks
    │   ├── routes/           # Protected routes
    │   ├── styles/           # CSS files
    │   ├── utils/            # Helper functions
    │   ├── App.jsx           # Main app
    │   └── main.jsx          # Entry point
    ├── package.json
    ├── vite.config.js
    └── Dockerfile
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/refresh/` - Refresh access token
- `POST /api/auth/logout/` - Logout and blacklist token
- `GET /api/auth/profile/` - Get user profile
- `PATCH /api/auth/profile/` - Update user profile

### Applications
- `GET /api/applications/` - List all applications (with filters)
- `POST /api/applications/` - Create new application
- `GET /api/applications/{id}/` - Get application details
- `PUT/PATCH /api/applications/{id}/` - Update application
- `DELETE /api/applications/{id}/` - Delete application
- `PATCH /api/applications/{id}/update_status/` - Update status (Kanban)

**Query Parameters:**
- `status` - Filter by status
- `applied_date_from` - Filter by date range
- `applied_date_to` - Filter by date range
- `search` - Search company or role

### Resumes
- `GET /api/resumes/` - List all resumes
- `POST /api/resumes/` - Upload new resume (multipart/form-data)
- `GET /api/resumes/{id}/` - Get resume details
- `DELETE /api/resumes/{id}/` - Delete resume

### Analytics
- `GET /api/analytics/` - Get user statistics

**Response includes:**
- `total_applications` - Total count
- `response_rate` - Percentage
- `average_response_time` - Days
- `status_distribution` - Array of counts per status
- `resume_performance` - Performance per resume

## 🎨 UI/UX Features

- **Modern Design** - Glassmorphism effects with vibrant gradients
- **Responsive Layout** - Mobile, tablet, and desktop optimized
- **Smooth Animations** - CSS transitions and micro-interactions
- **Dark Theme** - Professional color palette
- **Accessibility** - Semantic HTML and ARIA labels

## 🔐 Security Features

- JWT token authentication with refresh mechanism
- Password hashing with Django's built-in validators
- File type and size validation (PDF only, 5MB max)
- CORS configuration for frontend
- User-based permissions - users can only access their own data
- SQL injection prevention via Django ORM
- XSS protection with React

## 📧 Email Reminder System

The application includes Celery-based email reminders:

1. Set `follow_up_date` on applications
2. Celery Beat checks daily at 9 AM
3. Sends email reminders for applications due today

**Email Configuration** (in `.env`):
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833).

## 🚢 Deployment

### Backend (Render / Railway)

1. Push code to GitHub
2. Connect repository to Render/Railway
3. Set environment variables
4. Deploy with `gunicorn backend.wsgi:application`

**Environment Variables:**
```env
SECRET_KEY=<your-secret-key>
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=<postgres-url>
REDIS_URL=<redis-url>
EMAIL_HOST_USER=<email>
EMAIL_HOST_PASSWORD=<password>
```

### Frontend (Vercel / Netlify)

1. Build production bundle: `npm run build`
2. Deploy `dist` folder to Vercel/Netlify
3. Set environment variable:
```env
VITE_API_URL=https://your-backend-domain.com
```

### Docker Production

```bash
# Backend
cd backend
docker build -t job-tracker-backend .
docker run -p 8000:8000 --env-file .env job-tracker-backend

# Frontend
cd frontend
docker build -t job-tracker-frontend .
docker run -p 80:80 job-tracker-frontend
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Token refresh on expiry
- [ ] Create/edit/delete applications
- [ ] Drag application across Kanban columns
- [ ] Upload PDF resume
- [ ] View analytics dashboard
- [ ] Set follow-up date and check email
- [ ] Profile update

## 🛣️ Roadmap

Future enhancements:
- Automated testing (Jest, Pytest)
- Export applications to CSV/PDF
- Calendar view for follow-ups
- Application templates
- Interview preparation notes
- Mobile app (React Native)

## 📄 License

This project is open source and available for educational purposes.

## 👨‍💻 Architecture

### Backend Architecture
- **Modular Django Apps**: Separation of concerns with dedicated apps
- **Service Layer**: Business logic in analytics/services.py
- **RESTful API**: Following REST principles with DRF
- **Async Tasks**: Celery for background processing

### Frontend Architecture
- **Component-Based**: Reusable React components
- **Context API**: Global auth state management
- **API Layer**: Centralized Axios instance with interceptors
- **Protected Routes**: Authentication guards

### Database Schema
```
Users (Django built-in)
├── Applications (ForeignKey to User)
│   └── Resume (ForeignKey, optional)
└── Resumes (ForeignKey to User)
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review API responses for error messages

---

**Built with ❤️ using Django, React, and modern web technologies**
