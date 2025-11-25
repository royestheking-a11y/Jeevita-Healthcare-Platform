import React, { useState, useEffect } from 'react';
import { Heart, Search, User, ShoppingCart, Menu, X, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useData } from '../contexts/DataContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface NavbarProps {
  onNavigate: (page: string, data?: any) => void;
  currentPage: string;
}

export function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { doctors, medicines, hospitals } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{ type: string, id: string, name: string }[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const results: { type: string, id: string, name: string }[] = [];

      // Search doctors
      doctors.forEach(doctor => {
        if (doctor.name.toLowerCase().includes(query) ||
          doctor.specialty.toLowerCase().includes(query) ||
          doctor.location.toLowerCase().includes(query)) {
          results.push({ type: 'doctor', id: doctor.id, name: doctor.name });
        }
      });

      // Search medicines
      medicines.forEach(medicine => {
        if (medicine.name.toLowerCase().includes(query) ||
          medicine.brand.toLowerCase().includes(query) ||
          medicine.category.toLowerCase().includes(query)) {
          results.push({ type: 'medicine', id: medicine.id, name: medicine.name });
        }
      });

      // Search hospitals
      hospitals.forEach(hospital => {
        if (hospital.name.toLowerCase().includes(query) ||
          hospital.specialty.toLowerCase().includes(query) ||
          hospital.address.toLowerCase().includes(query)) {
          results.push({ type: 'hospital', id: hospital.id, name: hospital.name });
        }
      });

      setSearchResults(results.slice(0, 8)); // Limit to 8 results
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, doctors, medicines, hospitals]);

  const handleSearchResultClick = (result: { type: string, id: string, name: string }) => {
    if (result.type === 'doctor') {
      onNavigate('doctor-profile', { doctorId: result.id });
    } else if (result.type === 'medicine') {
      onNavigate('medicine-details', { medicineId: result.id });
    } else if (result.type === 'hospital') {
      onNavigate('hospital-details', { hospitalId: result.id });
    }
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSearchResultClick(searchResults[0]);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-amber-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl group-hover:shadow-amber-500/50 transition-all">
              <Heart className="h-6 w-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
              Jeevita
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
              <input
                type="text"
                placeholder={t('nav.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length > 0 && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="w-full pl-10 pr-4 py-2 border border-amber-200 rounded-xl bg-amber-50/30 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-amber-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full text-left px-4 py-3 hover:bg-amber-50 transition-colors border-b border-amber-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${result.type === 'doctor' ? 'bg-blue-100' :
                          result.type === 'medicine' ? 'bg-green-100' :
                            'bg-purple-100'
                          }`}>
                          <Search className={`h-4 w-4 ${result.type === 'doctor' ? 'text-blue-600' :
                            result.type === 'medicine' ? 'text-green-600' :
                              'text-purple-600'
                            }`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{result.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{result.type}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showSearchResults && searchQuery.trim().length > 0 && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-amber-200 rounded-xl shadow-xl z-50 p-4 text-center text-gray-500">
                  No results found
                </div>
              )}
            </form>
          </div>

          {/* Desktop Menu Items */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onNavigate('doctors')}
              className={`text-sm font-medium transition-all ${currentPage === 'doctors'
                ? 'text-amber-600'
                : 'text-gray-700 hover:text-amber-600'
                }`}
            >
              {t('nav.doctors')}
            </button>
            <button
              onClick={() => onNavigate('medicines')}
              className={`text-sm font-medium transition-all ${currentPage === 'medicines'
                ? 'text-amber-600'
                : 'text-gray-700 hover:text-amber-600'
                }`}
            >
              {t('nav.medicines')}
            </button>
            <button
              onClick={() => onNavigate('hospitals')}
              className={`text-sm font-medium transition-all ${currentPage === 'hospitals'
                ? 'text-amber-600'
                : 'text-gray-700 hover:text-amber-600'
                }`}
            >
              {t('nav.hospitals')}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-50 text-sm font-medium text-gray-700 transition-all"
            >
              {language === 'en' ? 'EN' : 'বাংলা'}
            </button>

            {/* Cart */}
            {user && user.role !== 'admin' && (
              <button
                onClick={() => onNavigate('cart')}
                className="relative p-2 rounded-lg hover:bg-amber-50 transition-all"
              >
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-amber-50 transition-all">
                    <Avatar className="h-9 w-9 ring-2 ring-amber-200 hover:ring-amber-400 transition-all">
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white font-semibold">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => onNavigate('dashboard')}>
                    {t('nav.dashboard')}
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => onNavigate('admin')}>
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => {
                    logout();
                    onNavigate('home');
                  }} className="text-red-600">
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => onNavigate('login')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
                >
                  {t('nav.login')}
                </Button>
                <Button
                  onClick={() => onNavigate('signup')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
                >
                  {t('nav.signup')}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-amber-50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6 text-amber-600" /> : <Menu className="h-6 w-6 text-amber-600" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-4 border-t border-amber-100 pt-4 mt-2 bg-white">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
              <input
                type="text"
                placeholder={t('nav.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length > 0 && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="w-full pl-10 pr-4 py-2 border border-amber-200 rounded-xl bg-amber-50/30 text-gray-900"
              />
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-amber-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        handleSearchResultClick(result);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-amber-50 transition-colors border-b border-amber-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${result.type === 'doctor' ? 'bg-blue-100' :
                          result.type === 'medicine' ? 'bg-green-100' :
                            'bg-purple-100'
                          }`}>
                          <Search className={`h-4 w-4 ${result.type === 'doctor' ? 'text-blue-600' :
                            result.type === 'medicine' ? 'text-green-600' :
                              'text-purple-600'
                            }`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{result.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{result.type}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </form>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  onNavigate('doctors');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 px-4 hover:bg-amber-50 rounded-lg text-gray-700 font-medium"
              >
                {t('nav.doctors')}
              </button>
              <button
                onClick={() => {
                  onNavigate('medicines');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 px-4 hover:bg-amber-50 rounded-lg text-gray-700 font-medium"
              >
                {t('nav.medicines')}
              </button>
              <button
                onClick={() => {
                  onNavigate('hospitals');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 px-4 hover:bg-amber-50 rounded-lg text-gray-700 font-medium"
              >
                {t('nav.hospitals')}
              </button>

              <div className="flex gap-2 px-4 py-2">
                <button
                  onClick={toggleLanguage}
                  className="flex-1 px-3 py-2 rounded-lg border border-amber-200 text-sm font-medium hover:bg-amber-50"
                >
                  {language === 'en' ? 'EN' : 'বাংলা'}
                </button>
              </div>

              {/* User Menu for Mobile */}
              {user ? (
                <div className="space-y-2 px-4">
                  <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 rounded-lg">
                    <Avatar className="h-10 w-10 ring-2 ring-amber-200">
                      <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white font-semibold">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  {user.role !== 'admin' && (
                    <button
                      onClick={() => {
                        onNavigate('cart');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between py-2 px-4 hover:bg-amber-50 rounded-lg text-gray-700 font-medium"
                    >
                      <span>Cart</span>
                      {cartCount > 0 && (
                        <span className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onNavigate('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-4 hover:bg-amber-50 rounded-lg text-gray-700 font-medium"
                  >
                    {t('nav.dashboard')}
                  </button>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left py-2 px-4 hover:bg-amber-50 rounded-lg text-gray-700 font-medium flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </button>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      onNavigate('home');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-4 hover:bg-red-50 rounded-lg text-red-600 font-medium"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-4">
                  <Button
                    onClick={() => {
                      onNavigate('login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                  >
                    {t('nav.login')}
                  </Button>
                  <Button
                    onClick={() => {
                      onNavigate('signup');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                  >
                    {t('nav.signup')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
