/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Environment variables types
interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_EMAILJS_REGISTRATION_TEMPLATE_ID: string;
    readonly VITE_EMAILJS_RESET_TEMPLATE_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// Asset imports
declare module '*.png' {
    const src: string;
    export default src;
}

declare module '*.jpg' {
    const src: string;
    export default src;
}

declare module '*.jpeg' {
    const src: string;
    export default src;
}

declare module '*.svg' {
    const src: string;
    export default src;
}

declare module '*.gif' {
    const src: string;
    export default src;
}

declare module '*.webp' {
    const src: string;
    export default src;
}
