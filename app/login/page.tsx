import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">VetMed ERP</h1>
          <p className="text-gray-600">Veterinary Medicine Management System</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
