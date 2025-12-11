import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, Popup, Source, Layer, NavigationControl, GeolocateControl, MapRef, ViewStateChangeEvent } from 'react-map-gl/mapbox';
import mapboxgl from 'mapbox-gl';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { ArrowLeft, Navigation, MapPin, Clock, AlertTriangle, Loader2, Compass, Ban, Trophy } from 'lucide-react';
import { toast } from 'sonner';

// Ensure Mapbox CSS is included
import 'mapbox-gl/dist/mapbox-gl.css';

// Access Token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Access Token Debug Log
console.log("Mapbox Configuration:", {
    hasToken: !!MAPBOX_TOKEN,
    tokenLength: MAPBOX_TOKEN?.length || 0,
    envMode: import.meta.env.MODE
});

// Haversine Distance Formula (km)
const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const deg2rad = (deg: number) => deg * (Math.PI / 180);

export function NearestHospitalPage({ onNavigate }: { onNavigate: (page: string) => void }) {
    const mapRef = useRef<MapRef>(null);
    const watchIdRef = useRef<number | null>(null);

    // State
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number, heading?: number } | null>(null);
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
    const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
    const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string, distanceVal: number } | null>(null);
    const [viewState, setViewState] = useState({
        longitude: 90.4125,
        latitude: 23.8103,
        zoom: 14,
        pitch: 0,
        bearing: 0
    });

    // Navigation Modes
    const [isNavigating, setIsNavigating] = useState(false);
    const [hasArrived, setHasArrived] = useState(false);

    // 1. Live Tracking Mechanism
    useEffect(() => {
        if (!navigator.geolocation) {
            toast.error("Geolocation not supported");
            return;
        }

        // Initial fetch
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                setViewState(v => ({ ...v, latitude, longitude }));
                fetchNearbyHospitals(latitude, longitude);
            },
            (err) => {
                console.error(err);
                toast.error("Could not get initial location");
            },
            { enableHighAccuracy: true }
        );

        // Real-time Watch
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, heading } = pos.coords;
                setUserLocation(prev => ({
                    lat: latitude,
                    lng: longitude,
                    heading: heading || prev?.heading || 0
                }));

                // If Navigation Mode is ON, lock camera to user
                if (isNavigating) {
                    setViewState(prev => ({
                        ...prev,
                        latitude,
                        longitude,
                        bearing: heading || prev.bearing, // Rotate map with user
                        zoom: 17, // Zoom in for navigation
                        pitch: 60 // 3D tilt
                    }));
                }
            },
            (err) => console.error("Tracking Error:", err),
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            }
        );

        return () => {
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, [isNavigating]);

    // 2. Arrival Detection
    useEffect(() => {
        if (isNavigating && selectedHospital && userLocation) {
            const distKm = getDistanceKm(userLocation.lat, userLocation.lng, selectedHospital.lat, selectedHospital.lng);

            // Check if within 50 meters (0.05 km)
            if (distKm < 0.05 && !hasArrived) {
                setHasArrived(true);
                setIsNavigating(false); // Stop locking camera
                toast.success("You have arrived at your destination!");
            }
        }
    }, [userLocation, selectedHospital, isNavigating, hasArrived]);

    // Fetch Nearby Hospitals using Mapbox Geocoding API
    const fetchNearbyHospitals = async (lat: number, lng: number) => {
        if (!MAPBOX_TOKEN) {
            console.warn("No Mapbox Token. Skipping API call.");
            toast.error("Map configuration error. Please contact support.");
            return;
        }

        console.log("Fetching hospitals for:", lat, lng);

        const searchQuery = "hospital";
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchQuery}.json?proximity=${lng},${lat}&limit=10&access_token=${MAPBOX_TOKEN}`;

        try {
            const res = await fetch(url);
            const data = await res.json();
            console.log("Hospital API Response:", data);

            if (data.features && data.features.length > 0) {
                setHospitals(data.features.map((f: any) => ({
                    id: f.id,
                    name: f.text,
                    address: f.properties.address || f.place_name,
                    lng: f.center[0],
                    lat: f.center[1]
                })));
                toast.success(`Found ${data.features.length} nearby hospitals`);
            } else {
                console.warn("No hospitals found. Trying clinics...");
                // Fallback: Clinic Search
                const clinicUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/clinic.json?proximity=${lng},${lat}&limit=10&access_token=${MAPBOX_TOKEN}`;
                const clinicRes = await fetch(clinicUrl);
                const clinicData = await clinicRes.json();

                if (clinicData.features && clinicData.features.length > 0) {
                    setHospitals(clinicData.features.map((f: any) => ({
                        id: f.id,
                        name: f.text,
                        address: f.properties.address || f.place_name,
                        lng: f.center[0],
                        lat: f.center[1]
                    })));
                    toast.success(`Found ${clinicData.features.length} nearby clinics`);
                } else {
                    toast.error("No hospitals or clinics found in this area. Try zooming out or moving the map.");
                }
            }
        } catch (e) {
            console.error("Fetch Error:", e);
            toast.error("Network error. Please check your connection.");
        }
    };

    const calculateRoute = async (hospital: any) => {
        if (!userLocation || !MAPBOX_TOKEN) return;
        const start = `${userLocation.lng},${userLocation.lat}`;
        const end = `${hospital.lng},${hospital.lat}`;
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.routes?.[0]) {
                const route = data.routes[0];
                setRouteGeoJSON({ type: 'Feature', geometry: route.geometry });
                setRouteInfo({
                    distance: `${(route.distance / 1000).toFixed(1)} km`,
                    duration: `${Math.round(route.duration / 60)} mins`,
                    distanceVal: route.distance
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const startNavigation = () => {
        setIsNavigating(true);
        setHasArrived(false);
        toast.info("Navigation Started");

        mapRef.current?.flyTo({
            center: [userLocation!.lng, userLocation!.lat],
            zoom: 18,
            pitch: 60,
            bearing: userLocation?.heading || 0,
            duration: 1500
        });
    };

    const stopNavigation = () => {
        setIsNavigating(false);
        setViewState(prev => ({ ...prev, pitch: 0, zoom: 14, bearing: 0 })); // Reset view
    };

    return (
        <div className="relative h-screen w-full bg-slate-50 flex flex-col overflow-hidden">
            {/* --- Top Bar --- */}
            <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
                <Button
                    variant="outline"
                    className="bg-white/90 backdrop-blur pointer-events-auto border-slate-200 shadow-lg hover:bg-slate-50 text-slate-800 rounded-full pl-3 pr-5"
                    onClick={() => onNavigate('home')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Exit
                </Button>

                {isNavigating && (
                    <div className="bg-orange-600 text-white px-6 py-2 rounded-full shadow-lg shadow-orange-500/20 animate-pulse font-bold flex items-center gap-2">
                        <Navigation className="h-5 w-5 fill-current" />
                        NAVIGATING
                    </div>
                )}
            </div>

            {/* --- Map --- */}
            <div className="flex-1 w-full h-full">
                {!MAPBOX_TOKEN ? (
                    <div className="flex h-full items-center justify-center bg-slate-100 text-slate-500">
                        <div className="text-center">
                            <Ban className="h-12 w-12 mx-auto mb-2 text-red-500" />
                            <p>Mapbox Token Missing</p>
                        </div>
                    </div>
                ) : (
                    <Map
                        ref={mapRef}
                        {...viewState}
                        onMove={evt => !isNavigating && setViewState(evt.viewState)} // Disable manual move if navigating (optional, usually good to allow pan but snap back)
                        style={{ width: '100%', height: '100%' }}
                        mapStyle="mapbox://styles/mapbox/streets-v12" // Light mode
                        mapboxAccessToken={MAPBOX_TOKEN}
                        pitchWithRotate={true}
                        dragRotate={true}
                    >
                        {!isNavigating && <NavigationControl position="bottom-right" />}
                        <GeolocateControl position="top-right" />

                        {/* --- User Marker (Orange Brand) --- */}
                        {userLocation && (
                            <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
                                <div className="relative flex items-center justify-center group">
                                    {/* Pulse Ring */}
                                    <div className="absolute h-20 w-20 bg-orange-500/20 rounded-full animate-ping delay-75"></div>
                                    <div className="absolute h-12 w-12 bg-orange-500/40 rounded-full animate-pulse"></div>
                                    {/* Core */}
                                    <div className="relative h-6 w-6 bg-orange-600 rounded-full border-2 border-white shadow-[0_0_15px_rgba(249,115,22,0.6)] z-20">
                                        {/* Direction Cone */}
                                        {isNavigating && (
                                            <div
                                                className="absolute -top-10 -left-[18px] w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[50px] border-b-orange-500/50 blur-[2px]"
                                                style={{ transform: `rotate(${userLocation.heading || 0}deg)`, transformOrigin: 'bottom center' }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </Marker>
                        )}

                        {/* --- Hospitals (Red Plus Markers) --- */}
                        {hospitals.map(h => (
                            <Marker
                                key={h.id}
                                longitude={h.lng}
                                latitude={h.lat}
                                anchor="center"
                            >
                                <div
                                    className={`relative transition-all duration-300 cursor-pointer ${selectedHospital?.id === h.id ? 'scale-125 z-50' : 'scale-100 hover:scale-110'}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log("Hospital Clicked:", h.name);
                                        setSelectedHospital(h);
                                        calculateRoute(h);
                                        mapRef.current?.flyTo({ center: [h.lng, h.lat], zoom: 16, pitch: 50, duration: 1500 });
                                    }}
                                >
                                    {/* Medical Cross Icon Background */}
                                    <div className={`h-12 w-12 rounded-full flex items-center justify-center shadow-xl border-3 ${selectedHospital?.id === h.id ? 'bg-red-600 border-white shadow-red-500/50 animate-bounce' : 'bg-white border-red-600 hover:shadow-red-500/30'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={selectedHospital?.id === h.id ? 'text-white' : 'text-red-600'}>
                                            <path d="M5 12h14" /><path d="M12 5v14" />
                                        </svg>
                                    </div>

                                    {/* Label Always Visible */}
                                    <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-lg whitespace-nowrap">
                                        {h.name}
                                    </div>
                                </div>
                            </Marker>
                        ))}

                        {/* --- Route Line (Orange) --- */}
                        {routeGeoJSON && (
                            <Source id="route" type="geojson" data={routeGeoJSON}>
                                <Layer
                                    id="route-line"
                                    type="line"
                                    layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                                    paint={{
                                        'line-color': '#f97316', // Orange-500
                                        'line-width': 6,
                                        'line-opacity': 0.8
                                    }}
                                />
                            </Source>
                        )}
                    </Map>
                )}
            </div>

            {/* --- Arrival Popup (Light Theme) --- */}
            {hasArrived && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-500">
                    <div className="bg-white border-2 border-orange-100 p-8 rounded-3xl shadow-2xl text-center max-w-sm mx-4 transform scale-110">
                        <div className="bg-orange-50 p-4 rounded-full w-fit mx-auto mb-6 ring-4 ring-orange-100">
                            <Trophy className="h-12 w-12 text-orange-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-wide uppercase">Destination Reached</h2>
                        <p className="text-slate-500 mb-8">You have arrived at <br /><span className="text-orange-600 font-bold">{selectedHospital?.name}</span></p>
                        <Button
                            className="bg-orange-600 hover:bg-orange-700 text-white w-full font-bold shadow-lg shadow-orange-500/25 py-6 text-lg rounded-xl"
                            onClick={() => {
                                setHasArrived(false);
                                setSelectedHospital(null);
                                setRouteGeoJSON(null);
                                stopNavigation();
                            }}
                        >
                            Complete Trip
                        </Button>
                    </div>
                </div>
            )}

            {/* --- Bottom Navigation Panel (Light Theme) --- */}
            {selectedHospital && !hasArrived && (
                <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-[400px] z-40">
                    <Card className="bg-white/95 backdrop-blur-md border-orange-100 text-slate-900 shadow-2xl overflow-hidden rounded-2xl">
                        {/* Progress Bar (Decoration) */}
                        <div className="h-1 bg-orange-100 w-full">
                            <div className="h-full bg-orange-500 w-1/3 animate-[shimmer_2s_infinite]"></div>
                        </div>

                        <CardHeader className="pb-2 pt-4 flex flex-row justify-between items-start gap-4">
                            <div>
                                <h3 className="text-xl font-bold leading-none mb-2">{selectedHospital.name}</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Hospital • {routeInfo?.distance || 'Nearby'}</p>
                            </div>
                            <div className="bg-orange-50 p-2 rounded-lg">
                                <Compass className="h-6 w-6 text-orange-500" />
                            </div>
                        </CardHeader>

                        <CardContent className="pt-2">
                            {/* Route Stats */}
                            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
                                <div className="text-center w-1/2 border-r border-slate-200">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Distance</p>
                                    <p className="text-xl font-black text-slate-900">{routeInfo?.distance || '--'}</p>
                                </div>
                                <div className="text-center w-1/2">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Est. Time</p>
                                    <p className="text-xl font-black text-orange-600">{routeInfo?.duration || '--'}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                {!isNavigating ? (
                                    <Button
                                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 shadow-md transition-all hover:scale-105"
                                        onClick={startNavigation}
                                        disabled={!routeGeoJSON}
                                    >
                                        <Navigation className="mr-2 h-5 w-5" /> GO NOW
                                    </Button>
                                ) : (
                                    <Button
                                        variant="destructive"
                                        className="bg-red-50 hover:bg-red-100 text-red-600 font-bold h-12 border border-red-200"
                                        onClick={stopNavigation}
                                    >
                                        STOP
                                    </Button>
                                )}

                                <Button
                                    variant="secondary"
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold h-12 border border-slate-200"
                                    onClick={() => setSelectedHospital(null)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* --- Hospital List Panel (When no hospital selected) --- */}
            {!selectedHospital && !hasArrived && hospitals.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl shadow-2xl border-t border-orange-100 max-h-[40vh] overflow-hidden">
                    {/* Handle Bar */}
                    <div className="flex justify-center pt-3 pb-2">
                        <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
                    </div>

                    {/* Header */}
                    <div className="px-4 pb-2 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">Nearby Hospitals</h3>
                        <p className="text-xs text-slate-500">{hospitals.length} found • Tap to select</p>
                    </div>

                    {/* Scrollable List */}
                    <div className="overflow-y-auto max-h-[28vh] px-2 py-2">
                        {hospitals.map((h, index) => {
                            const distKm = userLocation
                                ? getDistanceKm(userLocation.lat, userLocation.lng, h.lat, h.lng).toFixed(1)
                                : '?';

                            return (
                                <button
                                    key={h.id}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 active:bg-orange-100 transition-colors text-left mb-1 border border-transparent hover:border-orange-200"
                                    onClick={() => {
                                        console.log("List Item Clicked:", h.name);
                                        setSelectedHospital(h);
                                        calculateRoute(h);
                                        mapRef.current?.flyTo({ center: [h.lng, h.lat], zoom: 16, pitch: 50, duration: 1500 });
                                    }}
                                >
                                    {/* Icon */}
                                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                                            <path d="M5 12h14" /><path d="M12 5v14" />
                                        </svg>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-900 truncate">{h.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{h.address}</p>
                                    </div>

                                    {/* Distance Badge */}
                                    <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded-lg text-sm font-bold flex-shrink-0">
                                        {distKm} km
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
