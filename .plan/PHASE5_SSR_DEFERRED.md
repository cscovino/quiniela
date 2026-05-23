# Phase 5: SSR - Deferred

## Status
**DEFERRED** - Requires server adapter which conflicts with static hosting ($0 cost) requirement.

## What's Ready
- ✅ Firebase Admin SDK installed (`firebase-admin`)
- ✅ Admin utilities created (`src/lib/firebase-admin.ts`)
- ✅ Middleware with auth guard structure (`src/middleware.ts`)
- ✅ Locals interface defined for user context

## Blockers
- SSR requires `output: 'server'` + server adapter
- Firebase Hosting static mode doesn't support SSR
- Need to choose: Firebase Functions adapter, Node adapter, or different host

## When to Implement
1. When deployment target supports SSR (Firebase Functions, Vercel, Node server)
2. When server-side auth guards are needed
3. When user-specific data should be pre-rendered

## Alternative (Current Approach)
- Client-side auth with Firebase Auth
- API routes for cached data (`/api/matches`, `/api/rankings`)
- Protected pages use client-side `AuthGuard` component
- Middleware provides locale detection for static pages
