# Grady ReSellOps Dashboard

A multi-tenant returns/resale dashboard built with Next.js, Supabase, and
shadcn/ui with comprehensive partner management and invitation systems.

## Features

- ✅ **Two-Tier Registration System**: Business Owner and Platform Admin account types
- ✅ **Multi-Tenant Collaboration**: Business owners and partners can see each other's data within the same business
- ✅ **Invite Codes System**: Secure partner invitation with usage tracking
- ✅ **Multi-tenant Partner System**: Isolated partner dashboards with logo support
- ✅ **Role-based Access Control (RBAC)**: Admin, Partner Manager, and Store Manager roles
- ✅ **Partner Switching**: Environment switching with keyboard shortcuts and partner logos
- ✅ **Product Management**: Complete CRUD with status tracking and CSV import
- ✅ **Location Management**: Multi-location support with contact information
- ✅ **Member Management**: Invitation system with email notifications
- ✅ **Analytics Dashboard**: Modern charts and reporting
- ✅ **Theme System**: Complete dark/light mode implementation
- ✅ **Mobile Responsive**: Bottom navigation and responsive layouts
- ✅ **Modern UI**: shadcn/ui components with theme-aware styling

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
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM_ADDRESS=noreply@your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional: Debug Configuration
DEBUG_EMAILS=false
```

### 3. Run Database Migrations

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_create_storage_bucket.sql`
   - `supabase/migrations/003_rename_environments_to_partners.sql`
   - `supabase/migrations/004_fix_storage_policies.sql`
   - `supabase/migrations/005_enable_user_registration.sql`
   - `supabase/migrations/006_fix_account_type_logic.sql`
   - `supabase/migrations/007_swap_account_type_logic.sql`
   - `supabase/migrations/008_update_rls_for_multi_tenant.sql`
   - `supabase/migrations/009_update_trigger_for_business_id.sql`

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your_project_ref

# Run migrations
supabase db push
```

### 4. Create Admin User

Run the admin user creation script:

```bash
node scripts/create-admin-user.js
```

### 5. Start Development Server

```bash
npm run dev
```

### 6. Test the Application

- **Login**: http://localhost:3000/login
- **Registration**: http://localhost:3000/register
- **Admin Dashboard**: http://localhost:3000/admin
- **Partner Dashboard**: http://localhost:3000/[partner-slug]

## Registration System

### Two-Tier Account Types

The system supports two distinct account types:

#### 1. Business Owner Accounts

- **Capabilities**: Create and manage their own business dashboard, invite partners, track products
- **Registration**: Requires company name and personal details
- **Dashboard**: Business dashboard with partner management
- **Access**: Can invite partners to their business and see all business data
- **Data Access**: Can see data from all partners in their business

#### 2. Platform Admin Accounts

- **Capabilities**: Access system admin dashboard to manage all partners and businesses
- **Registration**: Requires company name and personal details
- **Dashboard**: System admin dashboard with full platform access
- **Access**: Can see all partners and businesses across the platform
- **Data Access**: Can see all data across all businesses

### Multi-Tenant Collaboration

#### Business Structure

- **Business Owner**: Creates a business and becomes the primary admin
- **Partners**: Users invited by the business owner to collaborate
- **Data Sharing**: All users in the same business can see each other's data
- **Isolation**: Different businesses are completely isolated from each other

#### How It Works

1. **Business Owner Registration**:
   - User selects "Business Owner" during registration
   - Creates their own business dashboard
   - Can invite partners to their business
   - Can see all data from partners in their business

2. **Partner Invitation**:
   - Business owner generates invite codes
   - Partners register using invite codes
   - Partners join the business owner's business
   - Partners can see all business data and contribute

3. **Data Access**:
   - Business owners and partners share the same `BUSINESS_ID`
   - All users in the same business can see each other's products, locations, sales
   - Complete isolation between different businesses
   - Platform admins can see all data across all businesses

### Invite Codes System

#### For Business Owners

- **Generate Codes**: Create invite codes with usage limits and expiration dates
- **Share Codes**: Copy codes or direct registration links
- **Track Usage**: Monitor code usage and expiration
- **Manage Access**: Control who can join their business

#### For Partners

- **Receive Code**: Get invite code from business owner via email, link, or direct sharing
- **Register**: Use code during registration process
- **Join Business**: Automatically join the business owner's business
- **Activate Account**: Complete email verification and partner activation

### Registration Flow

1. **Business Owner Registration**:
   ```
   User selects Business Owner → Enters company details → Account created → Business dashboard created → Redirected to dashboard
   ```

2. **Partner Registration**:
   ```
   User receives invite code → Clicks registration link → Registers as Partner → Email verification → Partner activation → Join business
   ```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   │   ├── login/page.tsx # Login page
│   │   └── register/page.tsx # Registration page
│   ├── (dashboard)/       # Dashboard routes
│   │   └── [env]/         # Partner-specific routes
│   │       ├── layout.tsx # Dashboard layout with sidebar
│   │       ├── page.tsx   # Dashboard overview
│   │       ├── products/  # Product management
│   │       ├── locations/ # Location management
│   │       ├── members/   # Member management with invite codes
│   │       ├── analytics/ # Analytics dashboard
│   │       └── settings/  # Partner settings
│   ├── admin/             # Admin routes
│   ├── partner-activation/ # Partner activation page
│   └── api/               # API routes
│       └── auth/          # Authentication APIs
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── members/          # Member management components
│   ├── admin/            # Admin-specific components
│   └── dashboard/        # Dashboard components
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase clients
│   ├── db/               # Database operations
│   ├── email/            # Email functionality
│   └── utils/            # Utility functions
└── types/                # TypeScript types
```

## Database Schema

### Core Tables

- `profiles` - User profiles with business_id for multi-tenant access
- `partners` - Multi-tenant partners (formerly environments) with logo support
- `memberships` - User-partner relationships with roles
- `invite_codes` - Partner invitation codes with usage tracking
- `locations` - Physical locations within partners
- `products` - Product inventory with full metadata
- `product_status_history` - Status change tracking
- `product_comments` - Product discussions
- `product_images` - Product image metadata
- `sales` - Sales records
- `partner_invites` - User invitations with expiration

### Multi-Tenant Structure

- `profiles.business_id` - Links users to their business (NULL for platform admins)
- `profiles.is_partner_admin` - TRUE for business owners, FALSE for platform admins
- `profiles.primary_partner_id` - Business owner's partner ID (NULL for platform admins)

### Roles

- `admin` - Full partner management access
- `store_manager` - Partner staff access
- `partner_admin` - Can create and manage their own partners

### Product Statuses

- `taken` - Product taken in
- `in_repair` - Product being repaired
- `selling` - Product for sale
- `sold` - Product sold
- `returned` - Product returned
- `discarded` - Product discarded

## Partner Management

### Creating Partners

1. **Business Owner Registration**: New business owners automatically get their own business dashboard
2. **Partner Setup**: Each business is isolated with its own data and settings
3. **Logo Support**: Partners can upload and display their logos
4. **Member Management**: Invite team members with specific roles

### Partner Access

- Users must be authenticated to access any partner
- Users can only access partners they have been invited to
- Business owners have full control over their business dashboard
- Platform admins have access to all partners

### Multi-Tenant Data Access

#### Business Owners

- Can see all data from partners in their business
- Can invite new partners to their business
- Can manage all business settings and configurations
- Have full CRUD access to all business data

#### Partners

- Can see all data from the business owner and other partners in the same business
- Can contribute products, locations, and sales data
- Can view analytics and reports for the entire business
- Have collaborative access to business data

#### Platform Admins

- Can see all data across all businesses
- Can manage all partners and businesses
- Have system-wide administrative access
- Can create and manage platform-level settings

### Invite Codes Management

#### Features

- **Usage Limits**: Set maximum number of uses per code
- **Expiration Dates**: Configure when codes expire
- **Direct Links**: Generate direct registration links
- **Usage Tracking**: Monitor how many times codes are used
- **Active/Inactive**: Enable/disable codes as needed

#### Business Owner Interface

- **Members Page**: Invite codes section for business owners
- **Settings Page**: Full invite code management
- **Copy Functionality**: Copy codes or direct links
- **Usage Statistics**: Track code usage and expiration

## Theme System

### Dark/Light Mode

- **Complete Implementation**: All components support both themes
- **Theme Toggle**: Available in sidebar footer and mobile menu
- **CSS Variables**: Uses OKLCH color format for consistent theming
- **Component Styling**: Theme-aware backgrounds and text colors

### Mobile Responsiveness

- **Bottom Navigation**: Mobile uses bottom navigation instead of sidebar
- **Responsive Layouts**: All pages adapt to mobile screens
- **Touch-Friendly**: Optimized for touch interactions
- **Grid Layouts**: Stats grids use 2-column layout on mobile

## Email System

### Features

- **Invitation Emails**: Send partner invitations via email
- **Email Templates**: Customizable email templates
- **Resend Integration**: Uses Resend for reliable email delivery
- **Email Testing**: Built-in email testing functionality

### Configuration

```env
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM_ADDRESS=noreply@your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Development

### Code Style

- Follow Standard.js rules (2 spaces, no semicolons, camelCase)
- Use functional components with hooks
- Prefer server components over client components
- Use TypeScript for type safety
- Follow the established file structure

### Navigation Rules

- Use `import Link from "next/link"` for all navigation
- Use `const router = useRouter(); router.push(url)` for programmatic navigation
- All routes render inside the dashboard layout - no full refresh
- Sidebar items use Link and highlight active routes
- Partner-based routing: `/[partner-slug]/[section]`

### UI Rules

- Use shadcn/ui components only - no native HTML styling
- Import from `@/components/ui/[component]`
- Use Tailwind CSS for styling
- Follow shadcn/ui design patterns
- Ensure mobile responsiveness
- Use theme-aware CSS variables

### Table Component Rules

- **Action Buttons**: Place action buttons in table toolbar alongside filter
  options
- **DataTable Props**: Use `actionButtons` prop to pass custom buttons
- **Filter Placeholders**: Use `filterPlaceholder` prop for context-appropriate
  filtering
- **Mobile Layout**: Use `space-y-4` for page headers to ensure proper mobile
  stacking
- **Row Selection**: Disabled by default - only enable when bulk actions are
  needed
- **Default Page Size**: Set to 10 rows
- **Pagination Display**: Show "X total row(s)" instead of selection count

### Data Fetching

- Use React Server Components for data fetching where possible
- Use server actions for mutations
- Implement proper error handling
- Use revalidatePath/router.refresh() after mutations
- Partner-scoped data access

### Security Rules

- All routes require authentication
- Partner-based data access control
- Role-based permissions
- Input validation with Zod schemas
- Secure API endpoints with RLS

## Testing

### Start Development Server

```bash
npm run dev
```

### Test Routes

- **Login**: http://localhost:3000/login
- **Registration**: http://localhost:3000/register
- **Admin Dashboard**: http://localhost:3000/admin
- **Partner Dashboard**: http://localhost:3000/[partner-slug]
- **Products**: http://localhost:3000/[partner-slug]/products
- **Locations**: http://localhost:3000/[partner-slug]/locations
- **Members**: http://localhost:3000/[partner-slug]/members
- **Analytics**: http://localhost:3000/[partner-slug]/analytics
- **Settings**: http://localhost:3000/[partner-slug]/settings

### Testing the Registration System

1. **Business Owner Registration**:
   - Go to `/register`
   - Select "Business Owner" account type
   - Fill in company name and personal details
   - Verify account creation and business dashboard setup

2. **Partner Registration**:
   - Generate invite code from business owner dashboard
   - Share invite code or direct link
   - Test partner registration with invite code
   - Verify partner activation and business access

3. **Multi-Tenant Testing**:
   - Create multiple business owners
   - Invite partners to different businesses
   - Verify data isolation between businesses
   - Test collaborative access within same business

4. **Invite Codes**:
   - Test code generation with different usage limits
   - Test code expiration functionality
   - Test direct link sharing
   - Verify usage tracking

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Configuration
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM_ADDRESS=noreply@your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional: Debug Configuration
DEBUG_EMAILS=false
```

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Troubleshooting

### Registration Issues

1. **"Database error saving new user"**:
   - Ensure all migrations have been run
   - Check that the `profiles` table exists
   - Verify RLS policies are properly configured

2. **Invite Code Not Working**:
   - Check if the code is active and not expired
   - Verify usage limits haven't been exceeded
   - Ensure the code belongs to the correct business

3. **Partner Activation Issues**:
   - Check email verification status
   - Verify invite code is valid
   - Ensure user has proper permissions

### Multi-Tenant Issues

1. **Data Not Visible**: Check if users have the same `BUSINESS_ID`
2. **Wrong Business Access**: Verify user's business assignment
3. **Platform Admin Access**: Ensure platform admins have `BUSINESS_ID = NULL`

### Common Issues

1. **Authentication Errors**: Make sure your Supabase environment variables are
   correct
2. **RLS Policy Errors**: Ensure all migrations have been applied
3. **TypeScript Errors**: Run `npm run build` to check for type issues
4. **No Partners**: If no partners exist, users will be redirected to
   registration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the development guidelines
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
