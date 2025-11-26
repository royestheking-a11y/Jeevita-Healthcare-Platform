import React from 'react';
import { Helmet } from 'react-helmet-async';

type SeoProps = {
    title: string;
    description: string;
    url?: string;
    image?: string;
    keywords?: string;
    noindex?: boolean;
    jsonLd?: object | null;
    lang?: string;
};

export const Seo: React.FC<SeoProps> = ({
    title,
    description,
    url,
    image,
    keywords,
    noindex,
    jsonLd,
    lang = 'en',
}) => {
    const defaultImage = 'https://jeevita.vercel.app/og-banner.jpg';
    const canonical = url || (typeof window !== 'undefined' ? window.location.href : '');

    return (
        <Helmet>
            <html lang={lang} />
            <title>{title}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            {noindex ? <meta name="robots" content="noindex, nofollow" /> : <meta name="robots" content="index, follow" />}
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:locale" content="en_BD" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image || defaultImage} />
            <meta property="og:url" content={canonical} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image || defaultImage} />

            {/* performance helps */}
            <link rel="preconnect" href="https://www.googletagmanager.com" />
            {/* structured data */}
            {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
        </Helmet>
    );
};

export default Seo;
