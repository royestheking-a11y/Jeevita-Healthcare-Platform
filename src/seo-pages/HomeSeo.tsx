import React from 'react';
import Seo from '../components/Seo';

export const HomeSeo: React.FC = () => {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "MedicalWebPage",
        "name": "Jeevita - Doctor Appointment & Online Medicine Delivery in Bangladesh",
        "url": "https://jeevita.vercel.app",
        "description": "Book doctors, order medicines, and find hospitals across Bangladesh with Jeevita."
    };

    return (
        <Seo
            title="Jeevita – Doctor Appointment & Online Medicine Delivery in Bangladesh"
            description="Book trusted doctors, order medicines with home delivery, and find hospitals across Bangladesh. Fast, local, secure."
            url="https://jeevita.vercel.app"
            image="https://jeevita.vercel.app/og-banner.jpg"
            keywords="doctor appointment bangladesh, medicine delivery bd, online doctor bd, hospital directory bd"
            jsonLd={jsonLd}
        />
    );
};
export default HomeSeo;
