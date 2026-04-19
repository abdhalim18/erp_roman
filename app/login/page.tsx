import { LoginForm } from '@/components/auth/login-form'
import { Store } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden p-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-300/30 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-300/30 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-blue-300/30 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20 mb-6">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Toko Roman</h1>
          <p className="text-gray-500 text-sm font-medium tracking-wide">ERP & Point of Sales Management</p>
        </div>
        
        <LoginForm />
        
        <p className="text-center text-xs text-gray-400 mt-8">
          &copy; {new Date().getFullYear()} Toko Roman. All rights reserved.
        </p>
      </div>
    </div>
  )
}
