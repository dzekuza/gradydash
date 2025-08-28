import { getUser } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'

interface UpgradeLayoutProps {
  children: React.ReactNode
}

export default async function UpgradeLayout({ children }: UpgradeLayoutProps) {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0]">
      {children}
    </div>
  )
}
