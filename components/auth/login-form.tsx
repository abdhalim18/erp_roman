'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { login } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/client' // Import client Supabase
import { LogIn, Loader2 } from 'lucide-react'

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
        setError(result.error)
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
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">VetMed Login</CardTitle>
        <CardDescription>
          Enter your credentials to access the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}