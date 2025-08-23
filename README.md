# Sasakawa Restaurant Service Request System

A comprehensive web application designed to streamline the process of booking restaurant services for university departments, managing service requests, approvals, invoicing, and financial tracking for campus catering services.

## Project Overview

**Current Status:** MVP Implementation Ready  
**Last Updated:** August 20, 2025  

The Sasakawa Restaurant Service Request System enables university departments to efficiently request catering services, manage approvals, and track financial transactions through a modern, role-based web platform.

## Tech Stack

### Frontend
- **React** via Vite with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **React Query** for data fetching
- **React Hook Form** with Zod validation
- **Clerk** for authentication and user management

### Backend
- **Node.js** with Express and TypeScript
- **PostgreSQL** database
- **Prisma ORM** for database management
- **Multer** for file uploads
- **Nodemailer** for email notifications
- **Clerk SDK** for backend authentication

## User Roles

The system supports three distinct user roles:

1. **🎯 Requester** - Department staff who submit service requests
2. **✅ Approver** - Department heads/deans who approve/reject requests  
3. **💰 Finance Officer** - Manages invoices, payments, and financial reporting

## Core Features

### 🔐 Authentication System
- University email authentication via Clerk
- Role-based access control
- Session persistence
- Secure user management

### 🌐 Public Information Pages
- **Homepage** - Service overview and company information
- **Services Page** - Catering options and venue descriptions
- **Menu Showcase** - Menu categories without pricing information

### 📋 Service Request Management
- Streamlined request form with comprehensive event details
- Form validation and file upload support
- Department approval workflow
- Real-time status tracking

### 📊 User Dashboard
- Personal request history and status tracking
- Detailed request views with timeline
- Advanced filtering and search capabilities
- Role-appropriate action buttons

### 🏢 Administration Sections
- **Approvals Page** - Review and action pending requests (Approvers)
- **Invoices Page** - Manage invoice lifecycle (Finance Officers)
- **Payments Page** - Record and track payments (Finance Officers)

### 📧 Notification System
- Email alerts for status changes
- In-app notifications
- Automated workflow triggers

## Project Structure

```
/sasakawa-restaurant-system
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   │   ├── public/    # Public pages (Home, Services, Menu)
│   │   │   ├── protected/ # Authenticated pages
│   │   │   └── auth/      # Authentication pages
│   │   ├── layouts/       # Layout components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── server/                # Express backend application
    ├── src/
    │   ├── controllers/   # Request handlers
    │   ├── middlewares/   # Express middlewares
    │   ├── routes/        # API route definitions
    │   └── utils/         # Backend utilities
    ├── prisma/           # Database schema and migrations
    └── uploads/          # File upload storage
```

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### 1. Clone and Install
```bash
git clone <repository-url>
cd sasakawa-restaurant-system

# Install frontend dependencies
cd client && npm install

# Install backend dependencies  
cd ../server && npm install
```

### 2. Environment Setup

**Client (.env):**
```bash
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:3000
```

**Server (.env):**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/sasakawa_db"
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret
PORT=3000
UPLOAD_DIR=./uploads
```

### 3. Database Setup
```bash
cd server
npx prisma migrate dev
npx prisma db seed
```

### 4. Run Development Servers
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm run dev
```

Visit: `http://localhost:5173` (frontend) and `http://localhost:3000` (backend)

## Key Features Implementation

### 📝 Service Request Form
Comprehensive form including:
- Event details (name, type, date, time, duration)
- Venue and attendee information
- Contact person details (name, phone)
- Department and financial information
- Service type selection
- File attachments for supporting documents

### 🔄 Approval Workflow
- Automatic routing to department approvers
- Email notifications for status changes
- Approve/reject actions with comments
- Request revision capabilities

### 💳 Financial Management
- Invoice generation from approved requests
- Payment recording and tracking
- Financial reporting and dashboards
- Integration with university cost centers

### 📱 Responsive Design
- Mobile-first responsive design
- Touch-friendly interfaces
- Progressive web app capabilities
- Cross-browser compatibility

## API Documentation

### Authentication Endpoints
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/webhook` - Clerk webhook handler

### Service Requests
- `GET /api/requests` - List user requests
- `POST /api/requests` - Create new request
- `GET /api/requests/:id` - Get request details
- `PUT /api/requests/:id` - Update request

### Approvals
- `GET /api/approvals` - List pending approvals
- `POST /api/approvals/:id/approve` - Approve request
- `POST /api/approvals/:id/reject` - Reject request

### Invoices & Payments
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/payments` - List payments
- `POST /api/payments` - Record payment

## Database Schema

The system uses PostgreSQL with Prisma ORM, featuring:
- **Users** with role-based permissions
- **Departments** with cost center information
- **Service Requests** with full lifecycle tracking
- **Invoices** with payment status management
- **Payments** with multiple payment methods
- **Attachments** for document management
- **Audit Logs** for compliance tracking

## Security Features

- 🔒 Clerk-based authentication with university email domains
- 🛡️ Role-based access control (RBAC)
- 🔐 API endpoint protection
- 📁 Secure file upload with validation
- 🌐 CORS configuration
- 🔍 Input sanitization and validation

## Testing

```bash
# Frontend tests
cd client && npm test

# Backend tests  
cd server && npm test

# E2E tests
npm run test:e2e
```

## Deployment

The application is designed for deployment on:
- **Frontend:** Vercel, Netlify, or static hosting
- **Backend:** Railway, Heroku, or any Node.js hosting
- **Database:** PostgreSQL on Railway, Supabase, or managed PostgreSQL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes with clear messages
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- **Email:** support@sasakawa-restaurant.edu
- **Documentation:** [Project Wiki](link-to-wiki)
- **Issues:** [GitHub Issues](link-to-issues)

---

**Built with ❤️ for Sasakawa University by [Your Team Name]**
# Sasakawa-Resturant
