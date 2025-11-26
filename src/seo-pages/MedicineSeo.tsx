import React from 'react';
import Seo from '../components/Seo';

type Props = { id: string; name: string; descriptionText?: string; image?: string; };

export const MedicineSeo: React.FC<Props> = ({ id, name, descriptionText, image }) => {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Drug",
        "name": name,
        "description": descriptionText || `${name} available for order.`,
        "url": `https://jeevita.vercel.app/medicine-details/${id}`
    };

    return (
        <Seo
            title={`${name} – Buy Online | Jeevita Pharmacy`}
            description={descriptionText || `Buy ${name} online in Bangladesh with home delivery.`}
            url={`https://jeevita.vercel.app/medicine-details/${id}`}
            image={image}
            keywords={`${name} price bd, buy ${name} online`}
            jsonLd={jsonLd}
        />
    );
};
export default MedicineSeo;
