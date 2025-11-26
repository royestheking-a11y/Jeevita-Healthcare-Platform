import React from 'react';
import Seo from '../components/Seo';

export const DoctorsSeo: React.FC = () => {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Jeevita Doctors Directory",
        "url": "https://jeevita.vercel.app/doctors"
    };

    return (
        <Seo
            title="Find Doctors in Bangladesh – Book Specialists Online | Jeevita"
            description="Search and book verified doctors in Bangladesh. Compare specialists, check experience, and schedule appointments."
            url="https://jeevita.vercel.app/doctors"
            keywords="find doctors bangladesh, specialist doctors bd, book doctor online"
            jsonLd={jsonLd}
        />
    );
};
export default DoctorsSeo;
