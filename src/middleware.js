import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected routes
const employeeRoutes = [];
const adminRoutes = ['/admin', '/admin/jobs', '/admin/companies', '/admin/users'];
const authRoutes = ['/register/company', '/register/employee', '/login'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get the token using next-auth getToken
  const token = await getToken({
    req: request,
    secret: 'Gy8P#mK9$vL2@nX5qR7*tJ4wZ1hF3bN6cA8dE0', // This must match the one in your authOptions
  });

  console.log('Token: ===>', token);

  // Function to redirect
  const redirectTo = (path) => {
    return NextResponse.redirect(new URL(path, request.url));
  };

  // If user is logged in (has token) and tries to access auth routes
  if (token && authRoutes.some(route => pathname.startsWith(route))) {
    // Redirect to appropriate dashboard based on user type
    if (token.type === 'company' || token.type === 'admin' || token.userType === 'company') {
      return redirectTo('/admin');
    } else if (token.type === 'employee' || token.userType === 'employee') {
      return redirectTo('/jobs');
    } else {
      return redirectTo('/jobs');
    }
  }

  // If no token, allow access to auth routes but redirect from protected routes
  if (!token) {
    if ([...employeeRoutes, ...adminRoutes].some(route => pathname.startsWith(route))) {
      return redirectTo('/login');
    }
    return NextResponse.next();
  }

  // Handle employee access attempts to admin routes
  if ((token.type === 'employee' || token.userType === 'employee') && 
      adminRoutes.some(route => pathname.startsWith(route))) {
    return redirectTo('/jobs');
  }

  // Handle admin/company access attempts to employee routes
  if (((token.type === 'admin' || token.type === 'company') || 
       (token.userType === 'admin' || token.userType === 'company')) && 
      employeeRoutes.some(route => pathname.startsWith(route))) {
    return redirectTo('/admin');
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 