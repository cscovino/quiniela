export function initWebVitals(onReport?: (metric: string, value: number) => void) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  const report = onReport || (() => {});

  // LCP - Largest Contentful Paint
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      report('LCP', lastEntry.startTime);
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // LCP not supported
  }

  // CLS - Cumulative Layout Shift
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as LayoutShift;
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
        }
      }
      report('CLS', clsValue);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch {
    // CLS not supported
  }

  // INP - Interaction to Next Paint
  try {
    const inpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        const maxEntry = entries.reduce((max, entry) =>
          entry.duration > max.duration ? entry : max,
        );
        report('INP', maxEntry.startTime);
      }
    });
    inpObserver.observe({ type: 'event', buffered: true });
  } catch {
    // INP not supported
  }

  // FCP - First Contentful Paint
  const fcpEntry = performance
    .getEntriesByType('paint')
    .find((e) => e.name === 'first-contentful-paint');
  if (fcpEntry) {
    report('FCP', fcpEntry.startTime);
  }
}

export function getNavigationTiming() {
  if (typeof window === 'undefined') return null;

  const nav = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined;
  if (!nav) return null;

  return {
    dns: nav.domainLookupEnd - nav.domainLookupStart,
    tcp: nav.connectEnd - nav.connectStart,
    ttfb: nav.responseStart - nav.requestStart,
    download: nav.responseEnd - nav.responseStart,
    domInteractive: nav.domInteractive - nav.startTime,
    domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
    loadComplete: nav.loadEventEnd - nav.startTime,
  };
}
