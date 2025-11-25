import React, { useState, useEffect } from 'react';
import { Heart, Facebook, Instagram, Linkedin, Shield, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FooterProps {
  onNavigate: (page: string) => void;
}

interface SocialMediaLinks {
  facebook: string;
  instagram: string;
  linkedin: string;
}

export function Footer({ onNavigate }: FooterProps) {
  const { t } = useLanguage();
  const [socialLinks, setSocialLinks] = useState<SocialMediaLinks>({
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
  });

  useEffect(() => {
    // Load social media links from localStorage
    const storedLinks = localStorage.getItem('socialMediaLinks');
    if (storedLinks) {
      try {
        setSocialLinks(JSON.parse(storedLinks));
      } catch (e) {
        console.error('Error loading social media links:', e);
      }
    }

    // Listen for storage changes (when admin updates links)
    const handleStorageChange = () => {
      const updatedLinks = localStorage.getItem('socialMediaLinks');
      if (updatedLinks) {
        try {
          setSocialLinks(JSON.parse(updatedLinks));
        } catch (e) {
          console.error('Error loading social media links:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also check periodically for changes
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-2.5 rounded-xl shadow-lg">
                <Heart className="h-6 w-6 text-white fill-white" />
              </div>
              <span className="text-2xl text-white font-bold">Jeevita</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Your trusted healthcare partner in Bangladesh. Quality medical services at your fingertips.
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Mail className="h-4 w-4 text-amber-400" />
                <span>jeevita.org@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Phone className="h-4 w-4 text-amber-400" />
                <span>01625691878</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <MapPin className="h-4 w-4 text-amber-400" />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Quick Links - Services */}
          <div>
            <h4 className="mb-4 text-white font-semibold">Services</h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => onNavigate('doctors')}
                  className="text-gray-300 hover:text-amber-400 transition-colors text-sm block"
                >
                  Find Doctors
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('medicines')}
                  className="text-gray-300 hover:text-amber-400 transition-colors text-sm block"
                >
                  Order Medicines
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('hospitals')}
                  className="text-gray-300 hover:text-amber-400 transition-colors text-sm block"
                >
                  Hospital Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="text-gray-300 hover:text-amber-400 transition-colors text-sm block"
                >
                  My Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links - Company */}
          <div>
            <h4 className="mb-4 text-white font-semibold">Company</h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="text-gray-300 hover:text-amber-400 transition-colors text-sm block"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-gray-300 hover:text-amber-400 transition-colors text-sm block"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="text-gray-300 hover:text-amber-400 transition-colors text-sm block"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="text-gray-300 hover:text-amber-400 transition-colors text-sm block"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Social Links & Admin */}
          <div>
            <h4 className="mb-4 text-white font-semibold">Connect With Us</h4>
            <p className="text-gray-300 text-sm mb-4">
              Stay updated with health tips and news
            </p>
            <div className="flex gap-3 mb-6">
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 p-3 rounded-xl transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 p-3 rounded-xl transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 p-3 rounded-xl transition-all hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>

            {/* Admin Panel Access */}
            <div className="mt-6 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl">
              <button
                onClick={() => onNavigate('admin-login')}
                className="text-amber-400 hover:text-amber-300 transition-colors text-sm flex items-center gap-2 group"
              >
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                  <Shield className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-medium">Admin Panel</span>
              </button>
              <p className="text-xs text-gray-400 mt-1 ml-7">Authorized access only</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex justify-center items-center">
            <p className="text-gray-400 text-sm text-center">
              © 2025 Jeevita. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
