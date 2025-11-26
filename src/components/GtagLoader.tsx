import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GA_MEASUREMENT_ID, initGtag, pageview } from '../lib/gtag';

const insertScript = (id: string) => {
    if (document.querySelector(`#gtag-${id}`)) return;
    const s = document.createElement('script');
    s.async = true;
    s.id = `gtag-${id}`;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(s);

    const inline = document.createElement('script');
    inline.id = `gtag-inline-${id}`;
    inline.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${id}', { send_page_view: false });
  `;
    document.head.appendChild(inline);
};

export const GtagLoader: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        insertScript(GA_MEASUREMENT_ID);
        initGtag();
        // initial pageview
        pageview(window.location.pathname + window.location.search);
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        // send page_view on route changes
        pageview(location.pathname + location.search);
    }, [location]);

    return null;
};
