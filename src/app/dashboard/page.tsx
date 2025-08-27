import { redirect } from 'next/navigation'

export default function DashboardPage() {
  // Redirect to demo environment for now
  redirect('/demo')
}
