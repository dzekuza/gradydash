import { InvitationOnlyMessage } from '@/components/auth/invitation-only-message'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <InvitationOnlyMessage />
      </div>
    </div>
  )
}
