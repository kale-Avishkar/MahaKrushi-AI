import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // We are using client-side AuthContext and localStorage now.
  // No server-side Supabase cookie verification.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
