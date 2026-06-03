// Service worker registration (prod only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

// Performance monitoring (dev only)
if ('PerformanceObserver' in window && import.meta.env.DEV) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (nav) {
        const metrics = {
          ttfb: Math.round(nav.responseStart - nav.requestStart),
          domInteractive: Math.round(nav.domInteractive - nav.startTime),
          loadComplete: Math.round(nav.loadEventEnd - nav.startTime),
        };
        // eslint-disable-next-line no-console
        console.debug('[Performance]', metrics);
      }
    }, 0);
  });
}
