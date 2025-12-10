import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import emergencyIcon from '../assets/emergency_doctor.jpeg';

interface EmergencySectionProps {
    onNavigate: (page: string) => void;
}

export function EmergencySection({ onNavigate }: EmergencySectionProps) {
    return (
        <section className="bg-gradient-to-br from-slate-50 to-blue-50/30 py-20 relative overflow-hidden mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/50 flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full mb-6 border border-red-100">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            <span className="text-red-600 font-semibold text-sm">24/7 AI Emergency Response</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">
                            Emergency <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">AI Doctor</span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Experience the future of immediate care. Our advanced AI triage system provides instant analysis and connects you with emergency specialists in seconds.
                        </p>
                        <Button
                            onClick={() => onNavigate('emergency')}
                            className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-6 rounded-xl font-bold shadow-lg shadow-red-500/30 transition-all hover:scale-105 border border-red-500 opacity-100 visible"
                            style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                        >
                            Start Emergency Checkup
                            <ArrowRight className="ml-2 h-5 w-5 text-white" />
                        </Button>
                    </div>
                    <div className="flex-1 relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/20 to-rose-200/20 rounded-full blur-3xl"></div>
                        <img
                            src={emergencyIcon}
                            alt="AI Doctor"
                            className="relative z-10 w-full max-w-sm mx-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500 rounded-2xl"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
