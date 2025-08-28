import { redirect } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function HomePage() {
  // Redirect to register to encourage new user signups
  redirect('/register')
}
