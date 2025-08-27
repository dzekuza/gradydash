import { RegisterForm } from '@/components/register-form'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <RegisterForm />
      </div>
    </div>
  )
}
