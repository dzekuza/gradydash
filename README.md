# Grady ReSellOps

A multi-tenant returns/resale dashboard for managing returned and refurbished
products from multiple resellers.

## Features

- 🔐 **Authentication**: Secure login/register with Supabase Auth
- 🏢 **Multi-tenant**: Separate environments for different resellers
- 📦 **Product Management**: Track products through their lifecycle
- 🏪 **Location Management**: Organize products by physical locations
- 👥 **Team Management**: Role-based access control
- 📊 **Analytics**: Dashboard with key metrics
- 🖼️ **Image Management**: Secure image uploads with signed URLs
- 📱 **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Forms**: React Hook Form, Zod validation
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **State Management**: URL params + lightweight context

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gradydash
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** Create a `.env.local` file in the root
   directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://zpmgeatxlvlxvbeoluyn.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbWdlYXR4bHZseHZiZW9sdXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMDAwNzksImV4cCI6MjA3MTg3NjA3OX0.hypZeCmKf_mzuMnLePfPcffRNQSJFR6pVu54B9_GATw
   ```

4. **Database Setup** The database schema has already been set up in Supabase
   with:
   - All necessary tables (profiles, environments, products, etc.)
   - Row Level Security (RLS) policies
   - Storage bucket for product images
   - Database triggers for automatic profile creation

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser** Navigate to
   [http://localhost:3000](http://localhost:3000)

## Database Schema

### Core Tables

- **profiles**: User profiles with authentication data
- **environments**: Multi-tenant environments (resellers)
- **memberships**: User roles within environments
- **products**: Product inventory with status tracking
- **product_status_history**: Audit trail for status changes
- **locations**: Physical storage locations
- **product_images**: Image attachments for products
- **sales**: Sales records
- **environment_invites**: Invitation system

### Product Lifecycle

Products follow this status flow:

- `taken` → `in_repair` | `selling` | `discarded`
- `in_repair` → `selling` | `discarded` | `returned`
- `selling` → `sold` | `returned`
- `sold` (terminal state)

## Authentication

The app uses Supabase Auth with:

- Email/password authentication
- Google OAuth integration
- Automatic profile creation on signup
- Protected routes with middleware
- Role-based access control

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/       # Protected dashboard routes
│   │   └── [env]/         # Environment-specific routes
│   ├── auth/              # OAuth callback
│   └── dashboard/         # Main dashboard
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard-specific components
│   └── product/          # Product management components
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase client configuration
│   ├── db/               # Database operations
│   └── utils/            # Helper functions
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Deployment

The app is ready for deployment on Vercel, Netlify, or any other
Next.js-compatible platform.

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
