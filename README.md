# GradyDash - Multi-Environment Dashboard

A modern, multi-tenant dashboard application built with Next.js 14, Supabase,
and shadcn/ui.

## 🚀 Features

### ✅ Working Features

- **Modern Sidebar Navigation**: Using shadcn/ui sidebar-07 component with
  collapsible design
- **Multi-Environment Support**: Switch between different environments
  seamlessly
- **SPA Navigation**: All navigation uses Next.js Link - no full page reloads
- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Type Safety**: Full TypeScript support throughout the application
- **Demo Environment**: Fully functional demo at `/demo` for testing

### 🎨 UI Components

- **shadcn/ui Integration**: All components from shadcn/ui library
- **Sidebar-07**: Modern collapsible sidebar with environment switcher
- **Breadcrumb Navigation**: Contextual breadcrumbs in header
- **Environment Switcher**: Popover with Command component for environment
  selection
- **Responsive Layout**: Adapts to mobile and desktop screens

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Supabase (Auth, Postgres, Storage)
- **Forms**: React Hook Form + Zod validation
- **State**: Server Actions + URL params (nuqs)
- **Styling**: Tailwind CSS with CSS variables

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   │   ├── [env]/         # Environment-specific routes
│   │   └── demo/          # Demo environment
│   └── dashboard/         # Main dashboard (redirects to demo)
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard-specific components
│   └── app-sidebar.tsx   # Main sidebar component (sidebar-07)
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase clients and auth
│   ├── db/               # Database operations
│   └── utils/            # Utility functions
└── types/                # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for production)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd gradydash
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🧪 Testing the Application

### Demo Environment

Visit `/demo` to see the fully functional demo environment:

- **Dashboard**: `/demo` - Overview with sample data
- **Products**: `/demo/products` - Product management
- **Locations**: `/demo/locations` - Location management
- **Members**: `/demo/members` - Member management
- **Analytics**: `/demo/analytics` - Analytics dashboard

### Navigation Features

- **Environment Switcher**: Click the environment name in the sidebar header
- **Collapsible Sidebar**: Click the hamburger menu to collapse/expand
- **Breadcrumb Navigation**: Contextual breadcrumbs in the header
- **SPA Navigation**: All navigation is instant - no page reloads

## 🎯 Key Features

### Sidebar-07 Integration

The application uses the latest shadcn/ui sidebar-07 component which provides:

- **Collapsible Design**: Sidebar can be collapsed to icon-only mode
- **Environment Switcher**: Integrated in the sidebar header
- **Responsive Behavior**: Adapts to mobile and desktop screens
- **Keyboard Navigation**: Full keyboard accessibility
- **Modern UI**: Clean, modern design with proper spacing and typography

### Multi-Environment Architecture

- **Environment-Based Routing**: Each environment has its own URL structure
- **Role-Based Access**: Different user roles for different environments
- **Isolated Data**: Each environment's data is completely isolated
- **Environment Switching**: Seamless switching between environments

## 🔧 Development

### Code Style

- Follow Standard.js rules (2 spaces, no semicolons, camelCase)
- Use functional components with hooks
- Prefer server components over client components
- Use TypeScript for type safety

### Navigation Rules

- Use `import Link from "next/link"` for all navigation
- Use `const router = useRouter(); router.push(url)` for programmatic navigation
- All routes render inside the dashboard layout - no full refresh
- Sidebar items use Link and highlight active routes

### UI Rules

- Use shadcn/ui components only - no native HTML styling
- Import from `@/components/ui/[component]`
- Use Tailwind CSS for styling
- Follow shadcn/ui design patterns

## 📊 Database Schema

The application uses a multi-tenant database schema with:

- **profiles**: User profiles
- **environments**: Multi-tenant environments
- **memberships**: User-environment relationships with roles
- **locations**: Physical locations within environments
- **products**: Product inventory with status tracking
- **sales**: Sales records
- **environment_invites**: User invitations

### Row Level Security (RLS)

All tables have Row Level Security enabled with:

- Environment-based access control
- Role-based permissions
- User isolation

## 🚧 Next Steps

### Planned Features

1. **Database Integration**: Connect to real Supabase database
2. **Authentication**: Implement Supabase Auth
3. **Product Management**: Full CRUD operations for products
4. **Image Uploads**: Product image management
5. **Barcode Scanning**: Mobile barcode scanning
6. **Analytics Dashboard**: Real-time analytics and reporting

### Development Priorities

1. Set up Supabase project and run migrations
2. Implement authentication flow
3. Connect database functions to real queries
4. Build product management interface
5. Add data tables with filtering and sorting

## 📝 License

This project is licensed under the MIT License.

---

**Status**: 🟢 **READY FOR FEATURE DEVELOPMENT**

The foundation is complete with modern sidebar-07 integration. All core
infrastructure is working and ready for real data connections and feature
development.
