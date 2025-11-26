import React from 'react';
import Seo from '../components/Seo';

type Props = { id: string; name: string; address?: string; image?: string; };

export const HospitalProfileSeo: React.FC<Props> = ({ id, name, address, image }) => {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Hospital",
        "name": name,
        "address": address,
        "url": `https://jeevita.vercel.app/hospital-details/${id}`
    };

    return (
        <Seo
            title={`${name} – Hospital Information | Jeevita`}
            description={`Find details, departments and contact of ${name} in Bangladesh.`}
            url={`https://jeevita.vercel.app/hospital-details/${id}`}
            image={image}
            keywords={`${name} hospital bd, ${name} dhaka`}
            jsonLd={jsonLd}
        />
    );
};
export default HospitalProfileSeo;
