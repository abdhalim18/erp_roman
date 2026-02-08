# Roman ERP System

A modern, full-stack ERP system for veterinary medicine management. This application provides comprehensive tools for managing products, customers, and orders with real-time inventory tracking.

## 🚀 Tech Stack

### Frontend & Backend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **React 18** - UI library for component rendering

### UI & Styling
- **shadcn/ui** - Reusable UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### Database & Authentication
- **Supabase** - PostgreSQL database with authentication
- **Row Level Security** - Fine-grained access control

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **Supabase Account** (free tier available at [supabase.com](https://supabase.com))

## 🛠️ Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd erp_vetmed
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 🗄️ Database Schema

The database consists of 4 main tables with proper relationships and constraints:

### 1. Customers
- Stores customer contact information and details
- Tracks customer status (active/inactive)
- Includes address and contact information

### 2. Products
- Manages product inventory with stock levels
- Tracks pricing, costs, and categories
- Includes minimum stock alerts and unit tracking

### 3. Orders
- Tracks customer orders with status and payment information
- Manages order totals, discounts, and taxes
- Links to customers and order items

### 4. Order Items
- Contains individual items within each order
- Stores quantities, prices, and subtotals
- References products and orders

## 🛠 Database Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Copy your project URL and anon key from the project settings

### 2. Run Migrations

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the query to create all tables and relationships
5. (Optional) Run `002_seed_sample_data.sql` to add sample data

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

## 🔐 Authentication

### Admin Login

1. Navigate to `/login` (or the root URL will redirect you)
2. Enter the admin credentials you created in Supabase
3. Click **Sign In**
4. You'll be redirected to the admin dashboard

### Default Credentials

Use the email and password you set up in Supabase during the database setup step.

## 📁 Project Structure

```
erp_vetmed/
├── app/                      # Next.js App Router
│   ├── actions/             # Server actions
│   │   └── auth.ts          # Authentication actions
│   ├── admin/               # Admin dashboard
│   │   ├── layout.tsx       # Admin layout with sidebar
│   │   └── page.tsx         # Admin dashboard page
│   ├── login/               # Login page
│   │   └── page.tsx
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page (redirects to login)
├── components/              # React components
│   ├── admin/              # Admin-specific components
│   │   ├── admin-header.tsx
│   │   └── admin-sidebar.tsx
│   ├── auth/               # Authentication components
│   │   └── login-form.tsx
│   └── ui/                 # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── card.tsx
│       ├── avatar.tsx
│       └── dropdown-menu.tsx
├── lib/                     # Utility libraries
│   ├── supabase/           # Supabase clients
│   │   ├── client.ts       # Browser client
│   │   ├── server.ts       # Server client
│   │   └── middleware.ts   # Middleware helper
│   └── utils.ts            # Utility functions
├── middleware.ts            # Next.js middleware for auth
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies

```

## 🎨 Features

### Core Features
- ✅ **Customer Management** - Track customer information and history
- ✅ **Product Inventory** - Manage products with stock tracking
- ✅ **Order Processing** - Create and manage customer orders
- ✅ **Real-time Updates** - Built with real-time data synchronization
- ✅ **Responsive UI** - Works on desktop and mobile devices
- ✅ **Secure Authentication** - Protected routes and admin access

### Technical Highlights
- Type-safe development with TypeScript
- Server-side rendering with Next.js
- Optimized database queries with proper indexing
- Row Level Security for data protection
- 📊 Reports & Analytics
- ⚙️ Settings & Configuration
- 👤 User Profile Management

## 🔧 Configuration

### Tailwind CSS

The project uses a custom Tailwind configuration with:
- Custom color scheme
- Dark mode support (class-based)
- Custom border radius
- shadcn/ui integration

### TypeScript

Strict mode enabled with path aliases:
- `@/*` maps to the root directory

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

This is a standard Next.js application and can be deployed to:
- Netlify
- AWS Amplify
- Railway
- Render
- Any platform supporting Node.js

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review Supabase documentation at [supabase.com/docs](https://supabase.com/docs)
3. Check Next.js documentation at [nextjs.org/docs](https://nextjs.org/docs)

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

Built with ❤️ using Next.js, React, and Supabase
