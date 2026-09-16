import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/explore', '/learn', '/jobs', '/guidance', '/profile'];
const AUTH_ROUTES = ['/login', '/register', '/reset-password'];
const SESSION_COOKIE = 'career_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isOnboardingRoute = pathname.startsWith('/onboarding');
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // 1. Pass through non-restricted routes immediately
  if (!isProtectedRoute && !isOnboardingRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  // 2. Unauthenticated user attempting to access protected or onboarding routes
  if (!token) {
    if (isProtectedRoute || isOnboardingRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Authenticated user attempting to access auth routes (login / register / reset-password)
  if (isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/explore/:path*',
    '/learn/:path*',
    '/jobs/:path*',
    '/guidance/:path*',
    '/profile/:path*',
    '/onboarding/:path*',
    '/login',
    '/register',
    '/reset-password',
  ],
};
