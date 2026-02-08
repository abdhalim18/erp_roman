import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // 1. Proteksi Halaman Admin
  if (path.startsWith('/admin')) {
    // Jika belum login, lempar ke login
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Jika user login TAPI role-nya bukan admin (misal cashier), lempar ke halaman cashier
    // Catatan: user_metadata mungkin kosong, jadi kita handle dengan optional chaining
    const role = user.user_metadata?.role || 'admin' // Default admin jika tidak ada role (untuk backward compatibility)
    
    if (role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/cashier' // Redirect unauthorized admin access to cashier page
      return NextResponse.redirect(url)
    }
  }

  // 2. Proteksi Halaman Kasir
  if (path.startsWith('/cashier')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // 3. Redirect Login Page jika sudah login
  if (user && path === '/login') {
    const role = user.user_metadata?.role || 'admin'
    const url = request.nextUrl.clone()
    
    if (role === 'cashier') {
      url.pathname = '/cashier'
    } else {
      url.pathname = '/admin'
    }
    
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}