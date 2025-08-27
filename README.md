# Grady ReSellOps Dashboard

A multi-tenant returns/resale dashboard built with Next.js, Supabase, and
shadcn/ui.

## Features

- ✅ Multi-tenant environment system
- ✅ Role-based access control (RBAC)
- ✅ Environment switching with keyboard shortcuts
- ✅ Product management with status tracking
- ✅ Location management
- ✅ Member management
- ✅ Analytics dashboard
- ✅ Modern UI with shadcn/ui components

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run Database Migrations

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_add_system_admin_support.sql`
   - `supabase/migrations/003_fix_environment_access_policies.sql`

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your_project_ref

# Run migrations
supabase db push
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Test the Application

- **Login**: http://localhost:3000/login
- **Demo Dashboard**: http://localhost:3000/demo
- **Create New Environment**: Use the "Add Environment" button in the
  environment switcher

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   │   ├── [env]/         # Environment-specific routes
│   │   └── demo/          # Demo environment
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard-specific components
│   └── app-sidebar.tsx   # Main sidebar
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase clients
│   ├── db/               # Database operations
│   └── utils/            # Utility functions
└── types/                # TypeScript types
```

## Product Categories

The system includes a comprehensive hierarchical category system for organizing
products:

### Category Structure

The categories are organized in a 3-level hierarchy:

1. **Top Level Categories** (10 main categories):
   - Small Electronics
   - Large Electronics
   - Home & Kitchen
   - Sports & Activity
   - Car & Vehicle
   - Pets
   - Gaming & Consoles
   - Office & Printers
   - Labels & Printing
   - Uncategorized

2. **Subcategories**: Each top-level category contains relevant subcategories
3. **Specific Items**: Further breakdown for specific product types

### Using Categories

- **Product Forms**: Use the category selector to assign multiple categories to
  products
- **CSV Import**: Include categories as semicolon-separated category IDs
- **Display**: Categories are shown as badges with full hierarchical paths
- **Validation**: Category IDs are validated against the system during import

### Category IDs

Categories use kebab-case IDs (e.g., `mobile-phones-main`, `laptops-main`). See
`src/lib/utils/categories.ts` for the complete list.

## Database Schema

### Core Tables

- `profiles` - User profiles
- `environments` - Multi-tenant environments
- `memberships` - User-environment relationships with roles
- `locations` - Physical locations within environments
- `products` - Product inventory
- `product_status_history` - Status change tracking
- `product_comments` - Product discussions
- `product_images` - Product image metadata
- `sales` - Sales records
- `environment_invites` - User invitations

### Roles

- `admin` - Full system access (system-wide)
- `store_manager` - Environment/store manager

### Product Statuses

- `taken` - Product taken in
- `in_repair` - Product being repaired
- `selling` - Product for sale
- `sold` - Product sold
- `returned` - Product returned
- `discarded` - Product discarded

## Troubleshooting

### "Page Not Found" When Creating Environments

If you get a 404 error when trying to access a newly created environment:

1. **Check Database Migrations**: Ensure all migrations have been run,
   especially `003_fix_environment_access_policies.sql`

2. **Verify RLS Policies**: The following policies should exist:
   - `Users can create environments` on environments table
   - `Users can create their own memberships` on memberships table

3. **Check Environment Creation**: The environment should be created with the
   current user as `created_by`

4. **Verify Access Logic**: The layout checks for access using:
   - User has membership in the environment, OR
   - User created the environment

### Common Issues

1. **Authentication Errors**: Make sure your Supabase environment variables are
   correct
2. **RLS Policy Errors**: Ensure all migrations have been applied
3. **TypeScript Errors**: Run `npm run build` to check for type issues

## Development

### Code Style

- Follow Standard.js rules (2 spaces, no semicolons)
- Use functional components with hooks
- Prefer server components over client components
- Use TypeScript for type safety

### Adding New Features

1. Create database migrations for schema changes
2. Add RLS policies for new tables
3. Create server actions for data operations
4. Build UI components using shadcn/ui
5. Add proper error handling and loading states

### Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build the application
npm run build
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
