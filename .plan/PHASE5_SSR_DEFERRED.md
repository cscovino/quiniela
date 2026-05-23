# Phase 5: SSR - Deferred (Updated 2026-05-23)

## Decision: Static + Cloud Functions (NOT SSR)

After completing Phases 0-4, we confirmed that **static hosting + Cloud Function endpoints** is the correct architecture for Quiniela. SSR is explicitly deferred indefinitely.

## Why not SSR?

- **Cost**: SSR requires Firebase Functions/Run adapter → cold starts, per-invocation billing
- **Complexity**: SSR adds server-side rendering complexity for minimal benefit
- **Free tier**: Static hosting is free; SSR would exceed free tier limits
- **Performance**: CDN-cached static HTML + edge-cached JSON endpoints = faster than SSR

## Current Architecture (Target State)

```
Firebase Hosting (CDN)
  ├─ Static HTML (Astro build) — cached 1 year (immutable)
  ├─ Edge-cached JSON via Functions:
  │    /api/standings  (s-maxage=60)
  │    /api/rankings   (s-maxage=60)
  │    /api/live       (s-maxage=30)
  └─ Security headers via firebase.json
```

## What replaced SSR needs

| SSR Need | Current Solution |
|----------|-----------------|
| Server-side auth guards | Client-side AuthGuard + NavBar auth bootstrap |
| Pre-rendered user data | Build-time data via `build-data.ts` (stale shell) |
| Dynamic content | Cloud Function endpoints with CDN caching |
| Locale detection | Static page pairs (es/en) — no middleware needed |

## When to reconsider SSR

1. If real-time personalization becomes critical (e.g., personalized homepages)
2. If SEO requires server-rendered auth-gated content
3. If deployment budget increases beyond free tier
