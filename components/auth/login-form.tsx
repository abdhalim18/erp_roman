'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { login } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowRight, Mail, LockKeyhole } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Lakukan login standar
      const result = await login(email, password)

      if (result.error) {
        // Terjemahkan pesan error Supabase ke Indonesia
        const errorMap: Record<string, string> = {
          'Invalid login credentials': 'Email atau kata sandi salah',
          'Email not confirmed': 'Email belum dikonfirmasi',
          'User not found': 'Pengguna tidak ditemukan',
          'Too many requests': 'Terlalu banyak percobaan, coba lagi nanti',
        }
        setError(errorMap[result.error] || result.error)
        setLoading(false)
        return
      }

      // 2. Cek role pengguna untuk redirect yang sesuai
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // Ambil role dari metadata, default ke 'admin' jika tidak ada
      const role = user?.user_metadata?.role || 'admin'

      // 3. Redirect berdasarkan role
      if (role === 'cashier') {
        router.push('/cashier')
      } else {
        router.push('/admin')
      }

      router.refresh()

    } catch (err) {
      setError('Terjadi kesalahan tak terduga')
      setLoading(false)
    }
  }

  return (
    <div className="backdrop-blur-xl bg-white/80 border border-white/50 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="space-y-1 mb-8 text-center sm:text-left">
        <h2 className="text-xl font-bold text-gray-900">Selamat Datang</h2>
        <p className="text-sm text-gray-500">
          Masuk dengan akun Anda untuk melanjutkan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2 relative">
          <Label htmlFor="email" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2 relative">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-gray-700 text-xs uppercase tracking-wider font-bold">Kata Sandi</Label>
          </div>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-11 transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-medium text-center">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Verifikasi...
            </>
          ) : (
            <>
              Masuk ke Dasbor
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}