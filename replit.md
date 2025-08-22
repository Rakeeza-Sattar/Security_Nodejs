# SecureHome Audit Platform

## Overview

SecureHome Audit Platform is a comprehensive web application that facilitates home security audits by licensed security officers. The platform manages the entire workflow from customer appointment booking to professional documentation of valuables and receipts for insurance purposes. It features role-based access for homeowners, security officers, and administrators, with integrated payment processing through Square and professional report generation capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Modern frontend built with React 18 and TypeScript for type safety
- **Vite Build System**: Fast development server and optimized production builds
- **Wouter Routing**: Lightweight client-side routing solution
- **TanStack Query**: Server state management with caching and synchronization
- **Shadcn/ui Components**: Consistent UI component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Form Management**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Express.js Server**: Node.js web framework handling API endpoints and middleware
- **Session-based Authentication**: Passport.js with local strategy for secure user authentication
- **Password Security**: Scrypt-based password hashing with salt for secure credential storage
- **Role-based Access Control**: Three-tier user system (homeowner, officer, admin) with route protection
- **RESTful API Design**: Standard HTTP methods with JSON responses for client-server communication

### Database Architecture
- **PostgreSQL**: Primary relational database for data persistence
- **Drizzle ORM**: Type-safe database toolkit with schema-first approach
- **Neon Database**: Serverless PostgreSQL provider for scalable cloud hosting
- **Schema Design**: Normalized tables for users, appointments, payments, audit items, reports, and monitoring
- **Session Storage**: PostgreSQL-backed session store for authentication persistence

### Authentication & Authorization
- **Passport.js Integration**: Local strategy authentication with Express sessions
- **Protected Routes**: Frontend route guards with role-based access control
- **Session Management**: Server-side session storage with PostgreSQL backend
- **Password Security**: Industry-standard scrypt hashing with random salt generation

### Data Management
- **Type-safe Schemas**: Drizzle schema definitions with Zod validation
- **Audit Trail**: Comprehensive tracking of appointments, items, and status changes
- **File Handling**: Support for document uploads and photo attachments during audits
- **Report Generation**: Structured data collection for professional audit reports

## External Dependencies

### Payment Processing
- **Square Payments API**: Credit card processing and subscription management
- **Square Web Payments SDK**: Frontend payment form integration
- **Payment Status Tracking**: Real-time payment status updates and webhook handling

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Connection Management**: WebSocket connections for serverless environments

### UI Framework
- **Radix UI Primitives**: Accessible component foundations for form elements, dialogs, and navigation
- **Lucide React Icons**: Consistent icon system throughout the application
- **Tailwind CSS**: Responsive design system with custom color palette and spacing

### Development Tools
- **TypeScript**: Static type checking for enhanced developer experience
- **ESBuild**: Fast JavaScript bundling for production builds
- **Vite Plugins**: Development enhancements including error overlays and cartographer integration
- **Replit Integration**: Development environment optimizations for cloud-based coding

### Third-party Services (Planned)
- **DocuSign API**: Digital signature collection for service agreements
- **Email Services**: Appointment confirmations and report delivery
- **File Storage**: Document and photo storage for audit materials
- **Title Monitoring**: Property title change monitoring services