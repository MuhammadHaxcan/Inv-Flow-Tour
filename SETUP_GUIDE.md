# Inv-Flow Setup Guide

This guide will help you set up and run the Inv-Flow application with React frontend and .NET Core backend.

## Prerequisites

1. **PostgreSQL Database**
   - Install PostgreSQL (version 12 or higher)
   - Create a database named `invflow`
   - Update connection string in `inv-flow-backend/appsettings.json` if needed

2. **.NET 8.0 SDK**
   - Install .NET 8.0 SDK from https://dotnet.microsoft.com/download

3. **Node.js and npm**
   - Install Node.js (version 16 or higher) from https://nodejs.org

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd inv-flow-backend
   ```

2. Restore NuGet packages:
   ```bash
   dotnet restore
   ```

3. Update the database connection string in `appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Port=5432;Database=invflow;Username=postgres;Password=your_password"
   }
   ```

4. Update JWT settings in `appsettings.json` (optional, but recommended for production):
   ```json
   "Jwt": {
     "Key": "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!",
     "Issuer": "InvFlow",
     "Audience": "InvFlowUsers"
   }
   ```

5. Run the application:
   ```bash
   dotnet run
   ```

   The API will be available at `https://localhost:5001` or `http://localhost:5000`

6. The database will be automatically created and seeded with:
   - Default admin user (username: `admin`, password: `admin123`)
   - Initial permissions
   - Default roles (Admin, User, Manager)
   - Sample accounts and expense types

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd inv-flow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the API base URL in `src/services/api.js` if your backend runs on a different port:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## Default Login Credentials

- **Username:** admin
- **Password:** admin123

## Features Implemented

### Backend Features

1. **Database Models**
   - Customer, Driver, Service, Account, ExpenseType
   - Invoice, InvoiceService, InvoiceExpense, Payment, Transaction
   - User, Role, Permission (with many-to-many relationships)

2. **Authentication & Authorization**
   - JWT token-based authentication
   - Role-based access control (RBAC)
   - Permission-based authorization
   - Custom `[RequirePermission]` attribute for controllers

3. **API Controllers**
   - AuthController (login, register, get current user)
   - CustomersController, DriversController, ServicesController
   - AccountsController, ExpenseTypesController
   - InvoicesController (with full CRUD and sub-resources)
   - TransactionsController
   - UsersController, RolesController, PermissionsController

4. **Validation**
   - FluentValidation for all DTOs
   - Data annotations on models

5. **Mapping**
   - AutoMapper for DTO to Entity mapping

6. **CORS Configuration**
   - Configured to allow React app on localhost:5173, 3000, and 5174

### Frontend Features

1. **Authentication**
   - Login page with JWT token storage
   - AuthContext for managing authentication state
   - Protected routes based on permissions

2. **Dynamic Navigation**
   - Navbar items shown/hidden based on user permissions
   - User info and logout button

3. **Admin Panel**
   - User management (create, edit, delete users)
   - Role management (create, edit, delete roles)
   - Permission assignment to roles
   - Role assignment to users

4. **API Integration**
   - All pages connected to backend API
   - Error handling and loading states
   - Automatic token refresh on API calls

## Permission System

The system uses a permission-based access control system. Permissions are organized by resource and action:

- `customers.read`, `customers.write`, `customers.delete`
- `drivers.read`, `drivers.write`, `drivers.delete`
- `services.read`, `services.write`, `services.delete`
- `accounts.read`, `accounts.write`, `accounts.delete`
- `expenses.read`, `expenses.write`, `expenses.delete`
- `invoices.read`, `invoices.write`, `invoices.delete`
- `transactions.read`
- `users.read`, `users.write`, `users.delete`
- `roles.read`, `roles.write`, `roles.delete`
- `permissions.read`

## Default Roles

1. **Admin** - Has all permissions
2. **User** - Has read permissions and limited write permissions
3. **Manager** - Has most permissions except user/role deletion

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user (requires authentication)

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/{id}` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

### Invoices
- `GET /api/invoices/open` - Get open invoices
- `GET /api/invoices/closed` - Get closed invoices
- `GET /api/invoices/{id}` - Get invoice by ID
- `GET /api/invoices/next-number` - Get next invoice number
- `POST /api/invoices` - Create invoice
- `POST /api/invoices/{id}/payments` - Add payment to invoice
- `POST /api/invoices/{id}/expenses` - Add expense to invoice
- `POST /api/invoices/{id}/services` - Add service to invoice
- `PUT /api/invoices/{id}/services` - Update invoice service
- `DELETE /api/invoices/{id}/services/{serviceId}` - Remove service from invoice
- `PUT /api/invoices/{id}/driver` - Assign driver to invoice
- `PUT /api/invoices/{id}/expenses/{expenseId}` - Update invoice expense
- `DELETE /api/invoices/{id}/expenses/{expenseId}` - Remove expense from invoice

### Users & Roles
- `GET /api/users` - Get all users (requires `users.read`)
- `POST /api/users` - Create user (requires `users.write`)
- `PUT /api/users/{id}` - Update user (requires `users.write`)
- `DELETE /api/users/{id}` - Delete user (requires `users.delete`)
- `GET /api/roles` - Get all roles (requires `roles.read`)
- `POST /api/roles` - Create role (requires `roles.write`)
- `PUT /api/roles/{id}` - Update role (requires `roles.write`)
- `DELETE /api/roles/{id}` - Delete role (requires `roles.delete`)
- `GET /api/permissions` - Get all permissions (requires `permissions.read`)

## Troubleshooting

### Backend Issues

1. **Database connection error**
   - Verify PostgreSQL is running
   - Check connection string in `appsettings.json`
   - Ensure database `invflow` exists

2. **Port already in use**
   - Change the port in `Properties/launchSettings.json`
   - Or stop the process using the port

3. **Migration errors**
   - Delete the database and let it recreate on startup
   - Or use EF Core migrations: `dotnet ef migrations add InitialCreate`

### Frontend Issues

1. **CORS errors**
   - Ensure backend CORS is configured correctly
   - Check that frontend URL matches allowed origins in `Program.cs`

2. **API connection errors**
   - Verify backend is running
   - Check API_BASE_URL in `src/services/api.js`
   - Check browser console for detailed error messages

3. **Authentication not working**
   - Clear browser localStorage
   - Verify JWT token is being stored
   - Check backend JWT configuration

## Development Notes

- The backend uses Entity Framework Core with PostgreSQL
- Database is automatically created on first run
- Seed data is automatically populated on startup
- All API endpoints require authentication except `/api/auth/login` and `/api/auth/register`
- Frontend automatically redirects to login if not authenticated
- Token is stored in localStorage and sent with every API request

## Next Steps

1. Change default admin password after first login
2. Configure production database connection string
3. Update JWT secret key for production
4. Set up HTTPS for production
5. Configure CORS for production domain
6. Add email verification for user registration
7. Implement password reset functionality
8. Add audit logging
9. Set up automated backups

