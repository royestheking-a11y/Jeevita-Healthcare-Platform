export const GA_MEASUREMENT_ID = 'G-PMLK0RGR9D';

// Basic gtag wrapper
declare global {
    interface Window { dataLayer: any[]; gtag?: (...args: any[]) => void; }
}

export const initGtag = () => {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) { window.dataLayer.push(args); }
    (window as any).gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
};

export const pageview = (url: string) => {
    if (typeof window === 'undefined' || !window.gtag) return;
    window.gtag('event', 'page_view', { page_path: url });
};

export const event = ({ action, params }: { action: string; params?: Record<string, any> }) => {
    if (typeof window === 'undefined' || !window.gtag) return;
    window.gtag('event', action, params);
};
