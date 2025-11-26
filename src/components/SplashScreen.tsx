import React from 'react';

export function SplashScreen() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
            <div className="relative flex flex-col items-center animate-in fade-in zoom-in duration-1000">
                {/* Logo Container with Pulse Effect */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-amber-400 rounded-full opacity-20 animate-ping blur-xl"></div>
                    <div className="relative bg-white p-6 rounded-3xl shadow-2xl shadow-amber-200/50">
                        <img
                            src="/favicon.svg"
                            alt="Jeevita Logo"
                            className="w-24 h-24 md:w-32 md:h-32 object-contain animate-pulse"
                        />
                    </div>
                </div>

                {/* Brand Name */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 tracking-tight">
                    Jeevita
                </h1>

                {/* Tagline */}
                <p className="text-lg md:text-xl text-gray-600 font-medium tracking-wide">
                    Healthcare Simplified
                </p>

                {/* Loading Indicator */}
                <div className="mt-12 flex space-x-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce"></div>
                </div>
            </div>
        </div>
    );
}
