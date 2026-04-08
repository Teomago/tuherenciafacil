import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// import { Ratelimit } from '@upstash/ratelimit'
// import { Redis } from '@upstash/redis'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname

  // --- Static File Guard: never let favicon.ico or other dotted paths reach intl ---
  if (path.includes('.')) {
    return NextResponse.next()
  }

  // --- Next.js internal routes and preview mode bypass ---
  if (path.startsWith('/next')) {
    return NextResponse.next()
  }

  // --- Rate Limiting (commented out — Upstash not installed) ---
  // if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  //   const redis = new Redis({
  //     url: process.env.KV_REST_API_URL,
  //     token: process.env.KV_REST_API_TOKEN,
  //   })
  //
  //   const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  //
  //   if (path.startsWith('/api/users/login')) {
  //     try {
  //       const { success, limit, reset, remaining } = await new Ratelimit({
  //         redis,
  //         limiter: Ratelimit.slidingWindow(5, '1 m'),
  //       }).limit(`auth_${ip}`)
  //
  //       if (!success) {
  //         return new NextResponse('Too Many Requests', {
  //           status: 429,
  //           headers: {
  //             'X-RateLimit-Limit': limit.toString(),
  //             'X-RateLimit-Remaining': remaining.toString(),
  //             'X-RateLimit-Reset': reset.toString(),
  //           },
  //         })
  //       }
  //     } catch (err) {
  //       console.error('Auth Rate limiter failed (Upstash Error):', err)
  //     }
  //   }
  // }

  // --- i18n Locale Routing (ALWAYS runs) ---
  return intlMiddleware(req)
}

export const config = {
  matcher: ['/', '/(en|es)/:path*', '/((?!admin|api|docs|next|_next|_vercel).*)'],
}
