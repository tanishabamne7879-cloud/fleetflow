# 🚀 FleetFlow - Fleet Management System

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive fleet management system built with **FastAPI** (backend) and **React** (frontend) with **MySQL** database.

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with refresh tokens
- OTP 2FA (Two-Factor Authentication) via email
- Role-based access control (Admin, FleetManager, Driver, Dispatcher)
- Secure password hashing with bcrypt

### 🚗 Vehicle Management
- Complete CRUD operations (Create, Read, Update, Delete)
- Vehicle status management (Available, Assigned, Maintenance, In Transit)
- Filter and search vehicles by status, type, registration
- Real-time vehicle statistics dashboard

### 📊 Dashboard & Monitoring
- Fleet overview with status counts
- Recent vehicle list
- Interactive vehicle management

### 🎯 Role-Based Access
| Role | Permissions |
|------|------------|
| **Admin** | Full access - All CRUD operations |
| **Fleet Manager** | Manage vehicles, view all data |
| **Dispatcher** | Update vehicle status, view data |
| **Driver** | View only assigned vehicles |

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI 0.104.1
- **Database**: MySQL 8.0
- **ORM**: SQLAlchemy 2.0.23
- **Authentication**: JWT + OTP 2FA
- **Migrations**: Alembic 1.12.1
- **Password Hashing**: bcrypt
- **Python**: 3.9+

### Frontend
- **Framework**: React 18.2.0
- **Styling**: Tailwind CSS 3.3.6
- **HTTP Client**: Axios 1.6.2
- **Routing**: React Router DOM 6.20.1
- **Notifications**: React Hot Toast 2.4.1
- **Build Tool**: Vite 5.0.8

## 📁 Project Structure


fleetflow/
├── backend/
│ ├── app/
│ │ ├── core/ # Security, dependencies
│ │ │ ├── deps.py
│ │ │ └── security.py
│ │ ├── crud/ # Database operations
│ │ │ ├── user.py
│ │ │ └── vehicle.py
│ │ ├── models/ # SQLAlchemy models
│ │ │ ├── user.py
│ │ │ ├── vehicle.py
│ │ │ └── ...
│ │ ├── routers/ # API endpoints
│ │ │ ├── auth.py
│ │ │ └── vehicle.py
│ │ ├── schemas/ # Pydantic schemas
│ │ │ ├── user.py
│ │ │ └── vehicle.py
│ │ ├── services/ # Business logic
│ │ │ ├── email_service.py
│ │ │ └── otp_service.py
│ │ ├── config.py
│ │ ├── database.py
│ │ └── main.py
│ ├── alembic/ # Database migrations
│ ├── requirements.txt
│ └── .env.example
├── frontend/
│ ├── src/
│ │ ├── api/ # API calls
│ │ │ └── axios.js
│ │ ├── components/ # React components
│ │ │ └── auth/
│ │ │ └── OTPVerification.jsx
│ │ ├── context/ # Context providers
│ │ │ └── AuthContext.jsx
│ │ ├── pages/ # Page components
│ │ │ ├── Login.jsx
│ │ │ ├── Signup.jsx
│ │ │ ├── Dashboard.jsx
│ │ │ ├── VehicleList.jsx
│ │ │ └── VehicleForm.jsx
│ │ ├── routes/ # Route protection
│ │ │ └── ProtectedRoute.jsx
│ │ ├── App.jsx
│ │ └── main.jsx
│ ├── package.json
│ ├── vite.config.js
│ ├── tailwind.config.js
│ └── .env.example
├── database_setup.sql
├── docker-compose.yml
└── README.md






## 📦 Installation

### Prerequisites

- Python 3.9+
- Node.js 18+
- MySQL 8.0+
- Redis (Optional)
- Git

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/fleetflow.git
cd fleetflow

# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials
# Open .env and update DATABASE_URL

# Create database
mysql -u root -p < database_setup.sql

# Run migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000