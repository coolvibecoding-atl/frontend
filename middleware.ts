import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next
    // - api (we'll handle api routes in the matcher above, but we want to let clerk handle them)
    // - static files
    // - favicon.ico
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico)).*)',
  ],
}