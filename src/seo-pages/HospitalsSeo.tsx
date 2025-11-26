import React from 'react';
import Seo from '../components/Seo';

export const HospitalsSeo: React.FC = () => {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Hospital",
        "name": "Bangladesh Hospitals Directory",
        "url": "https://jeevita.vercel.app/hospitals",
        "areaServed": "Bangladesh"
    };

    return (
        <Seo
            title="Best Hospitals in Bangladesh – Compare & Find Nearby Hospitals | Jeevita"
            description="Browse top hospitals in Bangladesh. Compare facilities, departments, locations and reviews to find the best hospital."
            url="https://jeevita.vercel.app/hospitals"
            keywords="hospital list bangladesh, best hospitals dhaka, hospital directory bd"
            jsonLd={jsonLd}
        />
    );
};
export default HospitalsSeo;
