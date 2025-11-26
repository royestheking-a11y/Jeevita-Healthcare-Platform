import React from 'react';
import Seo from '../components/Seo';

type Props = {
    id: string;
    name: string;
    specialty: string;
    image?: string;
    experience?: string;
};

export const DoctorProfileSeo: React.FC<Props> = ({ id, name, specialty, image, experience }) => {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Physician",
        "name": name,
        "medicalSpecialty": specialty,
        "url": `https://jeevita.vercel.app/doctor-profile/${id}`,
        "image": image || 'https://jeevita.vercel.app/doctor-default.jpg',
        "description": `${name} – ${specialty} with ${experience || 'experience'}`
    };

    return (
        <Seo
            title={`${name} – ${specialty} | Book Appointment | Jeevita`}
            description={`${name} is a ${specialty} in Bangladesh. Book appointment online via Jeevita.`}
            url={`https://jeevita.vercel.app/doctor-profile/${id}`}
            image={image}
            keywords={`${name}, ${specialty}, doctor bangladesh`}
            jsonLd={jsonLd}
        />
    );
};
export default DoctorProfileSeo;
