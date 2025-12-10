
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Video, MessageSquare, CheckCircle, Brain, HeartPulse, Thermometer, AlertTriangle, Activity, Baby, Stethoscope, ArrowRight, MapPin, Shield } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toast } from 'sonner';

// Mock location data for fallback
const MOCK_LOCATION = {
    latitude: 23.8103,
    longitude: 90.4125,
    address: "Gulshan 1, Dhaka, Bangladesh"
};

export function EmergencyPage({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
    const { doctors } = useData();
    const { user } = useAuth(); // Get user from AuthContext
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [address, setAddress] = useState<string>('');

    // Auth Protection
    useEffect(() => {
        if (!user) {
            // toast.error("Please login to access Emergency services.");
            // onNavigate('login');
        }
    }, [user, onNavigate]);

    if (!user) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border-t-4 border-red-500 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Shield className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Emergency Access Restricted</h2>
                    <p className="text-gray-600 mb-6">
                        To prioritize patient safety and data security, please sign in to access the Emergency AI Doctor service.
                    </p>
                    <div className="space-y-3">
                        <Button
                            className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-lg shadow-lg shadow-red-200"
                            onClick={() => onNavigate('login')}
                        >
                            Sign In / Login
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full h-12"
                            onClick={() => onNavigate('signup')}
                        >
                            Create Account
                        </Button>
                        <button
                            onClick={() => onNavigate('home')}
                            className="text-sm text-gray-400 hover:text-gray-600 mt-4 block mx-auto"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Chat States
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; parts: string; timestamp?: string }[]>([]);

    // Ref for chat container
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        // Use scrollTop on the container to prevent viewport jumping (navbar issue)
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, loading]);

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        symptoms: '',
        duration: '',
        severity: 'medium', // low, medium, high
        location: '',
        notes: '',
        emergencyType: ''
    });

    // Scroll to top when step changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            onNavigate('home');
        }
    };

    const handleDirectConnect = () => {
        if (formData.name && formData.symptoms) {
            toast.success("Connecting you to the nearest available doctor...");
            setStep(4); // Skip to doctor list
        } else {
            toast.error("Please fill in your Name and Symptoms first.");
        }
    };

    const handleAnalysis = async () => {
        if (!formData.symptoms && !formData.emergencyType) {
            toast.error("Please describe your symptoms or select an emergency type.");
            return;
        }

        setAnalyzing(true);

        // Simulate thinking time for better UX
        setTimeout(async () => {
            // STRATEGY: Check multiple environment variables to give the user flexibility in Vercel
            const keys = [
                import.meta.env.VITE_GEMINI_API_KEY,
                import.meta.env.VITE_GEMINI_API_KEY_2,
                import.meta.env.VITE_GEMINI_API_KEY_3
            ];

            // 1. Flatten comma-separated strings (if any)
            // 2. Filter out undefined/empty/placeholder values
            const validKeys = keys
                .filter(k => k && k.length > 10) // Basic length check
                .flatMap(k => k?.includes(',') ? k.split(',') : [k])
                .map(k => k?.trim())
                .filter(k => k && k.length > 10);

            // Pick a random key
            const apiKey = validKeys.length > 0 ? validKeys[Math.floor(Math.random() * validKeys.length)] : null;

            let resultData;

            if (apiKey) {
                const genAI = new GoogleGenerativeAI(apiKey);
                // Fallback mechanism: Try preferred model, then stable fallback
                const generateWithFallback = async (modelName: string, fallbackModelName: string, promptText: string) => {
                    try {
                        const model = genAI.getGenerativeModel({ model: modelName });
                        return await model.generateContent(promptText);
                    } catch (error: any) {
                        if (error.message?.includes('404') || error.message?.includes('not found')) {
                            console.warn(`Model ${modelName} failed, switching to ${fallbackModelName}`);
                            const fallbackModel = genAI.getGenerativeModel({ model: fallbackModelName });
                            return await fallbackModel.generateContent(promptText);
                        }
                        throw error;
                    }
                };

                const prompt = `Act as an emergency medical triage assistant. Analyze these symptoms: "${formData.symptoms}" and Emergency Type: "${formData.emergencyType}". 
                    Patient Age: ${formData.age}. Provide a brief assessment (safe, caution, or emergency), a list of likely causes (top 3), and immediate advice (bullet points). 
                    Format as JSON: { "assessment": "string", "causes": ["string"], "advice": ["string"] }`;

                try {
                    // Try 'gemini-1.5-flash-001' (specific version) -> Fallback to 'gemini-pro' (universal)
                    const result = await generateWithFallback("gemini-1.5-flash-001", "gemini-pro", prompt);
                    const response = await result.response;
                    const text = response.text();
                    // Basic cleanup to extract JSON if markdown blocks are present
                    const jsonStr = text.replace(/```json|```/g, '').trim();
                    resultData = JSON.parse(jsonStr);
                } catch (error: any) {
                    console.error("Gemini Error:", error);
                    if (error.message?.includes('API key')) {
                        toast.error("Invalid API Key configuration");
                    } else {
                        toast.error("AI Service Unavailable. Using offline mode.");
                    }
                    // Fallback to mock
                    resultData = getMockAnalysis(formData.symptoms);
                }
            } else {
                console.warn('Gemini API Key missing');
                // Use Mock Data
                resultData = getMockAnalysis(formData.symptoms);
            }

            setChatHistory([{
                role: 'model',
                parts: `Based on your symptoms (${formData.symptoms || formData.emergencyType}), here is my assessment:\n\n**Potential Causes:** ${resultData.causes.join(', ')}\n\n**Advice:**\n${resultData.advice.map((a: string) => `- ${a}`).join('\n')}\n\nPlease proceed to connect with a doctor if you feel worse.`
            }]);

            setAnalyzing(false);
            setStep(3); // Go to Chat/Analysis result
        }, 1500);
    };

    const getMockAnalysis = (symptoms: string) => {
        return {
            assessment: "Caution",
            causes: ["Viral Infection", "Stress/Fatigue", "Migraine"],
            advice: ["Rest in a dark room", "Stay hydrated", "Monitor temperature"]
        };
    };

    const handleChatSubmit = async () => {
        if (!chatInput.trim()) return;

        const userMsg = {
            role: 'user' as const,
            parts: chatInput,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const newHistory = [...chatHistory, userMsg];
        setChatHistory(newHistory);
        setChatInput('');
        setLoading(true);

        try {
            // STRATEGY: Check multiple environment variables
            const keys = [
                import.meta.env.VITE_GEMINI_API_KEY,
                import.meta.env.VITE_GEMINI_API_KEY_2,
                import.meta.env.VITE_GEMINI_API_KEY_3
            ];

            const validKeys = keys
                .filter(k => k && k.length > 10)
                .flatMap(k => k?.includes(',') ? k.split(',') : [k])
                .map(k => k?.trim())
                .filter(k => k && k.length > 10);

            const apiKey = validKeys.length > 0 ? validKeys[Math.floor(Math.random() * validKeys.length)] : null;

            if (apiKey) {
                const genAI = new GoogleGenerativeAI(apiKey);

                // Fallback mechanism for Chat
                const generateWithFallback = async (modelName: string, fallbackModelName: string, promptText: string) => {
                    try {
                        const model = genAI.getGenerativeModel({ model: modelName });
                        return await model.generateContent(promptText);
                    } catch (error: any) {
                        if (error.message?.includes('404') || error.message?.includes('not found')) {
                            const fallbackModel = genAI.getGenerativeModel({ model: fallbackModelName });
                            return await fallbackModel.generateContent(promptText);
                        }
                        throw error;
                    }
                };

                // Construct conversation history for context
                const historyPrompt = newHistory.map(msg =>
                    `${msg.role === 'user' ? 'Patient' : 'AI Doctor'}: ${msg.parts}`
                ).join('\n');

                const fullPrompt = `You are an expert AI Emergency Doctor. 
                Context: Patient (${formData.age}, ${formData.name}) has symptoms: ${formData.symptoms}.
                Previous conversation:
                ${historyPrompt}
                
                AI Doctor: (Reply naturally, keep it concise, reassuring, and medically sound. If serious, urge to see a doctor immediately.)`;

                // Try 'gemini-1.5-flash-001' -> Fallback 'gemini-pro'
                const result = await generateWithFallback("gemini-1.5-flash-001", "gemini-pro", fullPrompt);
                const response = await result.response;
                const text = response.text();

                setChatHistory([...newHistory, {
                    role: 'model',
                    parts: text,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            } else {
                // Fallback Mock
                setTimeout(() => {
                    setChatHistory([...newHistory, {
                        role: 'model',
                        parts: "I'm having trouble connecting to the network right now. Given your symptoms, I strongly recommend consulting a specialist immediately. Shall I help you find one?",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]);
                }, 1000);
            }
        } catch (error: any) {
            console.error("Chat Error:", error);
            const errorMsg = error.message || "Unknown error";
            toast.error(`Analysis failed: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const emergencyDoctors = doctors?.filter((doc: any) => doc.isEmergencyAvailable).concat(doctors.slice(0, 1)) || [];

    const handleLocate = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser.");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });

                try {
                    // Reverse Geocoding with OpenStreetMap (Nominatim) - Free & No API Key required for low usage
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();

                    if (data && data.display_name) {
                        setAddress(data.display_name);
                        setFormData(prev => ({ ...prev, location: data.display_name }));
                        toast.success("Location detected successfully!");
                    } else {
                        setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                        setFormData(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
                    }
                } catch (error) {
                    console.error("Geocoding error:", error);
                    // Fallback formatting
                    setFormData(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
                    toast.success("Coordinates detected.");
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error("Location error:", error);
                toast.error("Unable to retrieve your location. Please enter manually.");
                setLoading(false);
            }
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 pt-20 pb-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full mb-4">
                        <Activity className="h-8 w-8 text-red-600 animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency AI Doctor</h1>
                    <p className="text-gray-600">Instance Triage & Specialist Connection</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between mb-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s ? 'bg-red-600 text-white' : 'bg-white text-gray-400 border-2 border-gray-200'}`}>
                            {step > s ? <CheckCircle className="h-6 w-6" /> : s}
                        </div>
                    ))}
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col">

                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="p-8 animate-in fade-in slide-in-from-right duration-500">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Brain className="h-6 w-6 text-red-500" />
                                Tell us about yourself
                            </h2>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input
                                            placeholder="Enter name"
                                            value={formData.name}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                            className="h-12 text-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Age</Label>
                                        <Input
                                            type="number"
                                            placeholder="Age"
                                            value={formData.age}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, age: e.target.value })}
                                            className="h-12 text-lg"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Current Location</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="City / Area"
                                            value={formData.location}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                                            className="h-12"
                                        />
                                        <Button
                                            onClick={handleLocate}
                                            disabled={loading}
                                            variant="outline"
                                            className="h-12 px-6 border-red-200 text-red-600 hover:bg-red-50"
                                        >
                                            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div> : "Locate Me"}
                                        </Button>
                                    </div>
                                    {address && <p className="text-xs text-green-600 flex items-center mt-1"><CheckCircle className="h-3 w-3 mr-1" /> Location Verified</p>}
                                </div>
                                <div className="pt-4 space-y-4">
                                    <Button
                                        className="w-full h-14 text-lg bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200"
                                        onClick={() => setStep(2)}
                                        disabled={!formData.name}
                                    >
                                        Next Step <ArrowRight className="ml-2" />
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => onNavigate('near-hospitals')}
                                        className="w-full h-14 text-lg border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-center gap-2 rounded-xl shadow-sm transition-all hover:shadow-md"
                                    >
                                        <MapPin className="h-5 w-5" />
                                        <span className="hidden sm:inline">Locate Nearest Hospitals on Map</span>
                                        <span className="sm:hidden">Find Nearby Hospitals</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Symptoms */}
                    {step === 2 && (
                        <div className="p-8 animate-in fade-in slide-in-from-right duration-500">
                            {/* Emergency Type Selection */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <Activity className="h-6 w-6 text-red-500" />
                                    Emergency AI Assistance
                                </h2>
                                <p className="text-gray-500 mb-4">Select the type of emergency for faster AI triage:</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'Accident', label: 'Accident/Trauma', icon: AlertTriangle },
                                        { id: 'Cardiac', label: 'Cardiac/Chest Pain', icon: HeartPulse },
                                        { id: 'Respiratory', label: 'Respiratory', icon: Activity },
                                        { id: 'Pregnancy', label: 'Pregnancy/Labor', icon: Baby },
                                        { id: 'Fever', label: 'High Fever/Infection', icon: Thermometer },
                                        { id: 'Neuro', label: 'Neurological', icon: Brain },
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => {
                                                console.log("Selected:", type.id);
                                                setFormData({ ...formData, emergencyType: type.id });
                                            }}
                                            className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 font-semibold ${formData.emergencyType === type.id
                                                ? 'bg-red-600 border-red-600 text-white shadow-lg scale-105'
                                                : 'bg-white border-gray-100 text-gray-600 hover:border-red-200 hover:bg-red-50'
                                                }`}
                                        >
                                            <type.icon
                                                className={`h-8 w-8 ${formData.emergencyType === type.id ? 'text-white' : 'text-red-500'}`}
                                            />
                                            <span>{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-6 flex justify-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => onNavigate('near-hospitals')}
                                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 px-6 py-3 rounded-xl shadow-sm transition-all hover:shadow-md"
                                    >
                                        <MapPin className="h-5 w-5" />
                                        <span className="hidden sm:inline">Locate Nearest Hospitals on Map</span>
                                        <span className="sm:hidden">Find Nearby Hospitals</span>
                                    </Button>
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <HeartPulse className="h-6 w-6 text-red-500" />
                                Describe your symptoms
                            </h2>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label>What are you feeling?</Label>
                                    <textarea
                                        className="w-full min-h-[150px] p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none text-lg"
                                        placeholder="e.g. Severe headache, chest pain, difficulty breathing..."
                                        value={formData.symptoms}
                                        onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>How long have you felt this way?</Label>
                                        <Input
                                            value={formData.duration}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, duration: e.target.value })}
                                            placeholder="e.g. 2 hours"
                                            className="h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Severity</Label>
                                        <select
                                            className="w-full h-12 rounded-md border border-gray-200 px-3"
                                            value={formData.severity}
                                            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                        >
                                            <option value="low">Mild (Discomfort)</option>
                                            <option value="medium">Moderate (Painful)</option>
                                            <option value="high">Severe (Unbearable)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button variant="outline" className="flex-1 h-12" onClick={handleBack}>Back</Button>
                                    <Button
                                        className="flex-[2] h-12 bg-red-600 hover:bg-red-700 text-white"
                                        onClick={handleAnalysis}
                                        disabled={analyzing}
                                    >
                                        {analyzing ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Analyzing with AI...
                                            </span>
                                        ) : "Analyze Symptoms"}
                                    </Button>
                                </div>
                                <div className="text-center">
                                    <button onClick={handleDirectConnect} className="text-sm text-gray-400 hover:text-red-500 underline">
                                        Skip Analysis - Connect to Doctor
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: AI Analysis & Chat */}
                    {step === 3 && (
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right duration-500 bg-gray-50/50">
                            <div
                                ref={chatContainerRef}
                                className="flex-1 p-6 overflow-y-auto max-h-[500px] scroll-smooth"
                            >
                                <div className="space-y-6">
                                    {chatHistory.map((msg, idx) => (
                                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.role === 'model' && (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-50 to-red-100 border border-red-200 flex items-center justify-center flex-shrink-0">
                                                    <Brain className="w-4 h-4 text-red-600" />
                                                </div>
                                            )}

                                            <div className="flex flex-col max-w-[80%]">
                                                <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                                                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-tr-none'
                                                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                                    }`}>
                                                    <p className="whitespace-pre-line leading-relaxed text-[15px]">{msg.parts}</p>
                                                </div>
                                                <span className={`text-[10px] mt-1 px-1 ${msg.role === 'user' ? 'text-right text-gray-400' : 'text-left text-gray-400'}`}>
                                                    {msg.timestamp || 'Just now'}
                                                </span>
                                            </div>

                                            {msg.role === 'user' && (
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs font-bold text-gray-600">ME</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {loading && (
                                        <div className="flex gap-3 justify-start">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-50 to-red-100 border border-red-200 flex items-center justify-center flex-shrink-0">
                                                <Brain className="w-4 h-4 text-red-600" />
                                            </div>
                                            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                                                <div className="flex gap-1.5 ">
                                                    <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></span>
                                                    <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                    <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            <div className="p-4 bg-white border-t flex gap-3 shadow-lg shadow-gray-100 items-end">
                                <textarea
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    // startDate={undefined} // Removed invalid prop
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleChatSubmit();
                                        }
                                    }}
                                    placeholder="Type your message..."
                                    className="flex-1 min-h-[50px] max-h-[120px] p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none bg-gray-50 text-base"
                                />
                                <Button
                                    onClick={handleChatSubmit}
                                    className="h-[50px] w-[50px] rounded-xl bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 flex items-center justify-center shrink-0 transition-all hover:scale-105"
                                >
                                    <ArrowRight className="h-6 w-6" />
                                </Button>
                            </div>

                            <div className="px-6 py-3 bg-gray-50 border-t flex justify-between items-center text-sm">
                                <button onClick={handleBack} className="text-gray-500 hover:text-gray-800 font-medium">
                                    ← Back
                                </button>
                                <button className="text-green-600 hover:text-green-700 font-bold flex items-center gap-1" onClick={() => setStep(4)}>
                                    Connect to Doctor <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Doctor List */}
                    {step === 4 && (
                        <div className="p-8 animate-in fade-in slide-in-from-right duration-500">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Stethoscope className="h-6 w-6 text-red-500" />
                                Available Specialists
                            </h2>
                            <p className="text-gray-500 mb-6">Based on your symptoms, we recommend these specialists:</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {emergencyDoctors.map((doc: any) => (
                                    <Card key={doc.id} className="overflow-hidden transition-shadow border-t-4 border-t-amber-500 relative">
                                        {doc.isEmergencyAvailable && (
                                            <div className="absolute top-0 right-0 p-2">
                                                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                                                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                                                    LIVE
                                                </span>
                                            </div>
                                        )}
                                        <CardHeader className="p-0">
                                            <div className="h-32 bg-gray-100 relative">
                                                <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-5">
                                            <CardTitle className="flex justify-between items-start mb-2">
                                                <span>{doc.name}</span>
                                                <div className="flex items-center text-amber-500 text-sm">
                                                    ★ {doc.rating}
                                                </div>
                                            </CardTitle>
                                            <CardDescription className="text-gray-600 mb-4">
                                                {doc.specialty} • {doc.experience}y exp
                                            </CardDescription>
                                            <div className="flex gap-2">
                                                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                                                    <Video className="w-4 h-4 mr-2" />
                                                    Call Now
                                                </Button>
                                                <Button variant="outline" className="flex-1">
                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                    Chat
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            <div className="mt-8">
                                <Button variant="ghost" onClick={() => setStep(3)}>Back to Analysis</Button>
                                <Button variant="outline" className="ml-4" onClick={() => onNavigate('home')}>Back to Home</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
