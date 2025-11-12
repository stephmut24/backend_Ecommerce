# E-commerce Platform - Backend API

A comprehensive REST API for an e-commerce platform built with Node.js, TypeScript, and PostgreSQL. This backend supports user authentication, product management, and order processing with full CRUD operations.

## 📋 Table of Contents

- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Setup Instructions](#️-setup-instructions)
- [API Endpoints](#-api-endpoints)
- [Default Admin Account](#-default-admin-account)
- [Testing the API](#-testing-the-api)
- [Project Structure](#-project-structure)
- [Security Features](#-security-features)
- [Database Schema](#-database-schema)
- [Error Handling](#-error-handling)
- [Validation Rules](#️-validation-rules)
- [API Documentation](#-api-documentation)
- [Support](#-support)

## 🚀 Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **Development**: tsx for hot reloading

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
    git clone (https://github.com/stephmut24/backend_Ecommerce)
    cd e-commerce
```
### 2. Install Dependencies

```bash
    npm install
```
### 3. Environment Configuration

#### Create a .env file in the root directory with the following variables:

**env**

*DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db"*

*JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"*
*PORT="8000"*

    Replace the following placeholders:

    username: Your PostgreSQL username

    password: Your PostgreSQL password

    your-super-secret-jwt-key: A strong secret key for JWT encryption

### 4. Database Setup

#### Option A: Automatic Setup (Recommended)
Run the initialization script:

```bash
# Connect to PostgreSQL and run the init script
    psql -U postgres -f scripts/init-db.sql
    Option B: Manual Setup
    Connect to PostgreSQL:
```

```bash
    psql -U postgres
    Create the database and user:

    sql
    CREATE DATABASE ecommerce_db;
    \c ecommerce_db;
    Run the SQL commands from scripts/init-db.sql manually.
```

### 5. Start the Application

#### Development Mode (with hot reload):

```bash
    npm run dev
```
```bash
    npm run build
    npm start
```
## 📚 API Endpoints

#### Authentication Endpoints

Method	Endpoint	Description	Access
- POST	/api/auth/register	User registration	Public
- POST	/api/auth/login	User login	Public


#### Product Endpoints
```txt
Method	Endpoint	Description	Access
- GET	/api/products	Get all products (with search & pagination)	Public
- GET	/api/products/:id	Get product by ID	Public
- POST	/api/products	Create new product	Admin
- PUT	/api/products/:id	Update product	Admin
- DELETE	/api/products/:id	Delete product	Admin
```

### Order Endpoints
```txt
Method	Endpoint	Description	Access
- POST	/api/orders	Create new order	User
- GET	/api/orders	Get user's orders	User
- GET	/api/orders/:id	Get specific order	User
- PUT	/api/orders/:id/status	Update order status	Admin
- GET	/api/orders/admin/orders	Get all orders (admin)	Admin
```
## 🔐 Default Admin Account
```txt
The database initialization script creates a default admin user:

- Email: admin@ecommerce.com

- Password: Admin123!

- Role: admin
```

## 🧪 Testing the API

### 1. User Registration

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
  ```
### 2. User Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Create Product (Admin)
```bash
curl -X POST http://localhost:8000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "Test Product",
    "description": "This is a test product description",
    "price": 99.99,
    "stock": 50,
    "category": "Electronics"
  }'
```
### 4. Place Order
```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "items": [
      {
        "productId": "<product-uuid>",
        "quantity": 2
      }
    ]
  }'
```
## 📁 Project Structure
```txt
src/
├── config/          # Database and environment configuration
├── models/          # TypeScript interfaces and types
├── services/        # Business logic and database operations
├── routes/          # API route handlers
├── middleware/      # Custom middleware (auth, validation)
├── utils/           # Utility functions and response helpers
├── app.ts           # Express application setup
└── server.ts        # Server entry point
```

## 🔒 Security Features


- Password hashing with bcrypt

- JWT-based authentication

- Input validation with Zod

- SQL injection prevention with parameterized queries

- Role-based access control

- Environment variable protection

## 📊 Database Schema

#### The application uses the following main tables:

users - User accounts and authentication

products - Product catalog information

orders - Order headers and metadata

order_items - Order line items

## 🚨 Error Handling

#### The API returns consistent error responses with:

HTTP status codes

Success indicators

Descriptive messages

Detailed error arrays (when applicable)

## 🛡️ Validation Rules

#### User Registration:

Username: Alphanumeric, unique

Email: Valid format, unique

Password: 8+ chars, uppercase, lowercase, number, special character

#### Product Management:
Name: 3-100 characters

Description: 10-1000 characters

Price: Positive number

Stock: Non-negative integer

## 📘 API Documentation

👉 [Postman Documentation](https://documenter.getpostman.com/view/31459792/2sB3WttKT5)


## 🤝 Support
For issues or questions regarding this implementation, please check the API documentation or review the source code comments.

Note: This backend API is designed to work with a frontend client and provides all necessary endpoints for a fully functional e-commerce platform.

