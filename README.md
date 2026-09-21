# Thunder Kanban

A production-grade Kanban board application built with Django REST Framework and React. Manage your tasks with drag-and-drop functionality, JWT authentication, and a clean user interface.

---

## Features

- User registration and login with JWT authentication
- Google OAuth2 (Gmail) Sign-In and auto-registration with Google One Tap support
- Token rotation and automatic refresh
- Create, update, and delete boards
- Create, update, and delete columns
- Create, update, and delete tasks
- Drag and drop tasks between columns
- Task priority levels (low, medium, high)
- Duplicate boards (maximum 2 copies per board)
- Duplicate column name validation
- Task preview modal with full details
- Responsive design
- LocalStorage for boards, columns, and tasks data to ensure instant initial loads and reduce API call

---

## Tech Stack

**Backend:**
- Python 3.12+
- Django 5.x
- Django REST Framework
- PostgreSQL
- SimpleJWT for authentication
- google-auth-library (for Google token verification)
- drf-spectacular for API documentation

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- @react-oauth/google (Google Identity Services integration)
- Zustand for state management
- dnd-kit for drag and drop
- React Hook Form with Zod validation
- Axios for API requests

---

## Live Demo

> Frontend: https://thunder-kanban.vercel.app/
> Backend: https://thunder-kanban-api.onrender.com/api/docs/ OR https://thunder-kanban-api.onrender.com/api/redoc/

---


## Getting Started

### Prerequisites

- Python 3.12 or higher
- Node.js 18 or higher
- PostgreSQL 14 or higher

### Backend Setup

1. Clone the repository

```bash
git clone https://github.com/riches17atom/Kanban-Thunder.git
cd Kanban-Thunder
cd backend
```

2. Create a virtual environment and activate it
```bash
python -m venv venv
source venv/bin/activate  
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Create a .env file in the backend directory
```bash
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=127.0.0.1,localhost

DB_NAME=thunder_db
DB_USER=postgres
DB_PASSWORD=your-database-password
DB_HOST=localhost
DB_PORT=5432
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

7. Set the PostgreSQL Database

8. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

9. Start the development server
```bash
python manage.py runserver
```
The backend will be running at http://localhost:8000


### Frontend Setup

1. Open a new terminal and navigate to the frontend directory
```bash
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Create .env file in the frontend 
```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

4. Start the development server
```bash
npm run dev
```
The frontend will be running at http://localhost:5173


## API Documentation

| Documentation | URL |
|---------------|-----|
| Swagger UI | http://localhost:8000/api/v1/docs |
| ReDoc | http://localhost:8000/api/v1/redoc |

---
