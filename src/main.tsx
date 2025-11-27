import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { registerSW } from 'virtual:pwa-register';
import App from "./App.tsx";
import "./index.css";

// Register Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <GoogleOAuthProvider clientId="1060488985292-9109rvmg1j30v7qpq9793voc40ffrl49.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </HelmetProvider>
);
