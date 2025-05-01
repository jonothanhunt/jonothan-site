import { NextResponse } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host');
  const subdomain = hostname.split('.')[0];
  const isLocalhost = hostname.includes('localhost') || hostname.includes('lvh.me');

  // Skip middleware for static files and API routes
  if (
    url.pathname.startsWith('/_next/') || 
    url.pathname.includes('/api/')
  ) {
    return NextResponse.next();
  }

  // Handle /about and /work routes - but only in production
  if (!isLocalhost) {
    if (url.pathname === '/about') {
      return NextResponse.redirect(new URL('/#about', req.url), { status: 308 });
    }

    if (url.pathname === '/work') {
      return NextResponse.redirect(new URL('/#work', req.url), { status: 308 });
    }
  }

  // Get the pathname
  const path = url.pathname === '/' ? '' : url.pathname;

  // Route requests based on subdomains
  if (subdomain === 'blog') {
    const newUrl = new URL(url);
    newUrl.pathname = `/blog${path}`;
    return NextResponse.rewrite(newUrl);
  }

  if (subdomain === 'app') {
    const newUrl = new URL(url);
    newUrl.pathname = `/app${path}`;
    return NextResponse.rewrite(newUrl);
  }

  // Default behavior for the primary domain
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude static files, api routes, and other special Next.js paths
    '/((?!_next/|_vercel|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/about',
    '/work'
  ],
};