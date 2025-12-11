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
    <nav className="sticky top-0 z-50 bg-white border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="bg-gradient-to-tr from-orange-500 to-amber-500 p-2 rounded-lg shadow-md group-hover:shadow-orange-200 transition-all">
              <Heart className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent group-hover:from-orange-700 group-hover:to-amber-700 transition-all">
              Jeevita
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 flex-1 max-w-2xl mx-12">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
              <input
                type="text"
                placeholder={t('nav.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length > 0 && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="w-full pl-10 pr-4 py-2 border border-orange-100 rounded-lg bg-orange-50/50 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
              />
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-orange-100 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto ring-1 ring-orange-900/5">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors border-b border-orange-50 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${result.type === 'doctor' ? 'bg-blue-50 text-blue-600' :
                            result.type === 'medicine' ? 'bg-green-50 text-green-600' :
                              'bg-orange-50 text-orange-600'
                          }`}>
                          <Search className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 text-sm">{result.name}</p>
                          <p className="text-xs text-slate-500 capitalize">{result.type}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showSearchResults && searchQuery.trim().length > 0 && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 text-center text-slate-500 text-sm">
                  No results found
                </div>
              )}
            </form>
          </div>

          {/* Desktop Menu Items */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('doctors')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === 'doctors'
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/50'
                }`}
            >
              {t('nav.doctors')}
            </button>
            <button
              onClick={() => onNavigate('medicines')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === 'medicines'
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/50'
                }`}
            >
              {t('nav.medicines')}
            </button>
            <button
              onClick={() => onNavigate('hospitals')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === 'hospitals'
                  ? 'text-orange-600 bg-orange-50'
                  : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/50'
                }`}
            >
              {t('nav.hospitals')}
            </button>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <button
              onClick={() => onNavigate('emergency')}
              className="px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Emergency
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="ml-2 px-2.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-600 transition-colors"
            >
              {language === 'en' ? 'EN' : 'বাংলা'}
            </button>

            {/* Cart */}
            {user && user.role !== 'admin' && (
              <button
                onClick={() => onNavigate('cart')}
                className="relative p-2 ml-1 rounded-full hover:bg-orange-50 transition-colors group"
              >
                <ShoppingCart className="h-5 w-5 text-slate-600 group-hover:text-orange-600" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium min-w-[1.25rem] text-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 ml-3 p-0.5 rounded-full hover:ring-2 hover:ring-orange-100 transition-all">
                    <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback className="bg-gradient-to-tr from-orange-500 to-amber-500 text-white text-xs font-medium">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1 border border-orange-100 shadow-lg rounded-xl">
                  <div className="px-3 py-2.5 bg-orange-50/50 border-b border-orange-100">
                    <p className="font-medium text-slate-900 text-sm truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <DropdownMenuItem onClick={() => onNavigate('dashboard')} className="rounded-lg cursor-pointer focus:bg-orange-50 focus:text-orange-900">
                      {t('nav.dashboard')}
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <DropdownMenuItem onClick={() => onNavigate('admin')} className="rounded-lg cursor-pointer focus:bg-orange-50 focus:text-orange-900">
                        <Shield className="h-4 w-4 mr-2 text-orange-600" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => {
                        logout();
                        onNavigate('home');
                      }}
                      className="rounded-lg cursor-pointer focus:bg-red-50 text-red-600 focus:text-red-700 mt-1"
                    >
                      {t('nav.logout')}
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-3 ml-4">
                <Button
                  variant="ghost"
                  onClick={() => onNavigate('login')}
                  className="text-slate-600 hover:text-orange-600 hover:bg-orange-50"
                >
                  {t('nav.login')}
                </Button>
                <Button
                  onClick={() => onNavigate('signup')}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-200 border-0"
                >
                  {t('nav.signup')}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-orange-50 text-slate-600 hover:text-orange-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-4 border-t border-orange-100 pt-4 mt-0 bg-white absolute left-0 right-0 px-4 shadow-xl z-40">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
              <input
                type="text"
                placeholder={t('nav.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length > 0 && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="w-full pl-10 pr-4 py-2.5 border border-orange-200 rounded-lg bg-orange-50/30 text-slate-900 text-sm focus:outline-none focus:border-orange-500"
              />
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-orange-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        handleSearchResultClick(result);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors border-b border-orange-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${result.type === 'doctor' ? 'bg-blue-50 text-blue-600' :
                            result.type === 'medicine' ? 'bg-green-50 text-green-600' :
                              'bg-orange-50 text-orange-600'
                          }`}>
                          <Search className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 text-sm">{result.name}</p>
                          <p className="text-xs text-slate-500 capitalize">{result.type}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </form>

            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  onNavigate('doctors');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2.5 px-4 hover:bg-orange-50 rounded-lg text-slate-700 font-medium text-sm"
              >
                {t('nav.doctors')}
              </button>
              <button
                onClick={() => {
                  onNavigate('medicines');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2.5 px-4 hover:bg-orange-50 rounded-lg text-slate-700 font-medium text-sm"
              >
                {t('nav.medicines')}
              </button>
              <button
                onClick={() => {
                  onNavigate('hospitals');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2.5 px-4 hover:bg-orange-50 rounded-lg text-slate-700 font-medium text-sm"
              >
                {t('nav.hospitals')}
              </button>
              <button
                onClick={() => {
                  onNavigate('emergency');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2.5 px-4 hover:bg-red-50 rounded-lg text-red-600 font-bold text-sm"
              >
                Emergency AI Doctor
              </button>

              <div className="flex gap-2 px-4 py-2 mt-2">
                <button
                  onClick={toggleLanguage}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-50 text-slate-700"
                >
                  {language === 'en' ? 'EN' : 'বাংলা'}
                </button>
              </div>

              {/* User Menu for Mobile */}
              {user ? (
                <div className="space-y-1 mt-2 pt-2 border-t border-orange-100">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Avatar className="h-10 w-10 ring-2 ring-orange-100">
                      <AvatarFallback className="bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-semibold">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>

                  {user.role !== 'admin' && (
                    <button
                      onClick={() => {
                        onNavigate('cart');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between py-2.5 px-4 hover:bg-orange-50 rounded-lg text-slate-700 font-medium text-sm"
                    >
                      <span>Cart</span>
                      {cartCount > 0 && (
                        <span className="bg-orange-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
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
                    className="w-full text-left py-2.5 px-4 hover:bg-orange-50 rounded-lg text-slate-700 font-medium text-sm"
                  >
                    {t('nav.dashboard')}
                  </button>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left py-2.5 px-4 hover:bg-orange-50 rounded-lg text-slate-700 font-medium text-sm flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4 text-orange-600" />
                      Admin Panel
                    </button>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      onNavigate('home');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2.5 px-4 hover:bg-red-50 rounded-lg text-red-600 font-medium text-sm"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-4 mt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onNavigate('login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full border-slate-200 text-slate-700 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200"
                  >
                    {t('nav.login')}
                  </Button>
                  <Button
                    onClick={() => {
                      onNavigate('signup');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md"
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
