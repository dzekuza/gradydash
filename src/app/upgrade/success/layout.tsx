import { getUser } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'

interface UpgradeSuccessLayoutProps {
  children: React.ReactNode
}

export default async function UpgradeSuccessLayout({ children }: UpgradeSuccessLayoutProps) {
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
