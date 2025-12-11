# Inv-Flow Frontend

A comprehensive invoice and expense management system built with React, Vite, and Bootstrap. This frontend application provides a modern, responsive interface for managing invoices, customers, drivers, expenses, and financial reporting.

## 🚀 Features

- **Invoice Management**: Create, edit, and track invoices with VAT calculations
- **Customer Management**: Manage customer information and contact details
- **Driver Management**: Assign drivers to invoices and track schedules
- **Expense Tracking**: Record and manage business expenses
- **Financial Reports**: Comprehensive reporting with filtering capabilities
- **Bank Statement**: View transaction history and account balances
- **Calendar View**: Visual calendar for invoice and driver scheduling
- **Role-based Access Control**: Secure authentication and authorization

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Bootstrap 5** - Responsive CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Modern icon library
- **Axios** - HTTP client for API communication
- **React Phone Input** - International phone number input
- **FullCalendar** - Calendar component for scheduling

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API server (see backend documentation)

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd inv-flow

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
# Development: http://localhost:5104/api
# Production: https://your-api-domain.com/api
VITE_API_URL=http://localhost:5104/api

# Application Environment
VITE_NODE_ENV=development

# Debug logging (optional)
VITE_DEBUG=true
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Build for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Modal.jsx       # Base modal component
│   ├── StatusModal.jsx # Unified modal for alerts/confirmations
│   ├── SearchableSelect.jsx
│   └── ...
├── pages/              # Page components
│   ├── Reports.jsx
│   ├── OpenInvoices.jsx
│   └── ...
├── contexts/           # React contexts for state management
│   ├── DataContext.jsx
│   └── AuthContext.jsx
├── hooks/              # Custom React hooks
├── services/           # API service functions
├── utils/              # Utility functions
└── constants/          # Application constants
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Secure API communication
- XSS protection

## 🎨 UI/UX Features

- Responsive Bootstrap design
- Dark/light mode support
- Accessible components with ARIA labels
- Loading states and error handling
- Mobile-friendly interface

## 📊 Key Components

### Reports System
- Service, Customer, Driver, and Summary reports
- Date range filtering
- Export capabilities
- Real-time data updates

### Invoice Management
- Create invoices with services and expenses
- VAT calculation (5%)
- Driver assignment
- Email notifications
- Print functionality

### Financial Tracking
- Bank statement with transaction history
- Expense management
- Payment processing
- Outstanding balance tracking

## 🔄 Recent Improvements

- ✅ Fixed filtering logic in Reports page
- ✅ Added comprehensive filtering to invoice pages
- ✅ Removed conflicting CSS dependencies
- ✅ Created shared modal components
- ✅ Fixed performance issues in DataContext
- ✅ Improved error handling and user feedback

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

This project is proprietary software. See LICENSE file for details.

## 🆘 Support

For support and questions, please contact the development team.
