# API Documentation

## Base URL
- Development: `http://localhost:8000`
- Production: `https://your-domain.com`

## Authentication

All endpoints except `/api/auth/register/` and `/api/auth/login/` require JWT authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

### Register User
```http
POST /api/auth/register/
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password2": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJh...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJh..."
}
```

### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

### Refresh Token
```http
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJh..."
}
```

### Logout
```http
POST /api/auth/logout/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJh..."
}
```

## Applications

### List Applications
```http
GET /api/applications/
Authorization: Bearer <access_token>

Query Parameters:
- status (optional): applied, hr_contacted, interview, offer, rejected
- applied_date_from (optional): YYYY-MM-DD
- applied_date_to (optional): YYYY-MM-DD
- search (optional): search company or role
```

**Response:**
```json
[
  {
    "id": 1,
    "company_name": "Google",
    "role": "Software Engineer",
    "job_url": "https://careers.google.com/...",
    "status": "interview",
    "applied_date": "2026-01-15",
    "follow_up_date": "2026-02-15",
    "resume": 2,
    "resume_details": {
      "id": 2,
      "title": "SWE Resume",
      "file": "/media/resumes/2026/01/resume.pdf"
    },
    "notes": "Technical interview scheduled",
    "created_at": "2026-01-15T10:30:00Z",
    "updated_at": "2026-02-01T14:20:00Z"
  }
]
```

### Create Application
```http
POST /api/applications/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "company_name": "Microsoft",
  "role": "Backend Developer",
  "job_url": "https://careers.microsoft.com/...",
  "status": "applied",
  "applied_date": "2026-02-10",
  "follow_up_date": "2026-02-20",
  "resume": 1,
  "notes": "Applied via LinkedIn"
}
```

### Update Application Status (Kanban)
```http
PATCH /api/applications/1/update_status/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "interview"
}
```

### Delete Application
```http
DELETE /api/applications/1/
Authorization: Bearer <access_token>
```

## Resumes

### List Resumes
```http
GET /api/resumes/
Authorization: Bearer <access_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Software Engineer Resume",
    "file": "/media/resumes/2026/02/my_resume.pdf",
    "uploaded_at": "2026-02-01T10:00:00Z",
    "success_rate": 75.5,
    "total_applications": 8
  }
]
```

### Upload Resume
```http
POST /api/resumes/
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Fields:
- title: string
- file: PDF file (max 5MB)
```

### Delete Resume
```http
DELETE /api/resumes/1/
Authorization: Bearer <access_token>
```

## Analytics

### Get User Statistics
```http
GET /api/analytics/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "total_applications": 15,
  "response_rate": 66.67,
  "average_response_time": 8.5,
  "status_distribution": [
    { "status": "applied", "count": 5 },
    { "status": "interview", "count": 4 },
    { "status": "hr_contacted", "count": 3 },
    { "status": "offer", "count": 1 },
    { "status": "rejected", "count": 2 }
  ],
  "resume_performance": [
    {
      "id": 1,
      "title": "SWE Resume",
      "total_applications": 10,
      "success_rate": 70.0
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "field_name": ["Error message"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error."
}
```
