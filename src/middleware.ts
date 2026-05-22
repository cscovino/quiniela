import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request } = context;
  const pathname = new URL(request.url).pathname;

  const locale = pathname.startsWith('/en') ? 'en' : 'es';
  context.locals.locale = locale;

  return next();
};

declare module 'astro' {
  interface Locals {
    locale: 'en' | 'es';
    user?: {
      uid: string;
      email: string;
      displayName: string;
      role: 'user' | 'admin';
    };
  }
}
