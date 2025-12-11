import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, Popup, Source, Layer, NavigationControl, GeolocateControl, MapRef, ViewStateChangeEvent } from 'react-map-gl/mapbox';
import mapboxgl from 'mapbox-gl';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { ArrowLeft, Navigation, MapPin, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Ensure Mapbox CSS is included
import 'mapbox-gl/dist/mapbox-gl.css';

// Access Token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Debug Log for Vercel troubleshooting
console.log("Mapbox Configuration:", {
    hasToken: !!MAPBOX_TOKEN,
    tokenLength: MAPBOX_TOKEN?.length || 0,
    envMode: import.meta.env.MODE
});

export function NearestHospitalPage({ onNavigate }: { onNavigate: (page: string) => void }) {
    const mapRef = useRef<MapRef>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
    const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
    const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewState, setViewState] = useState({
        longitude: 90.4125,
        latitude: 23.8103,
        zoom: 13
    });

    // Get User Location on Mount
    useEffect(() => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                setViewState(prev => ({ ...prev, latitude, longitude, zoom: 14 }));
                fetchNearbyHospitals(latitude, longitude);
                setLoading(false);
            },
            () => {
                toast.error("Unable to retrieve your location");
                // Default to Dhaka
                fetchNearbyHospitals(23.8103, 90.4125);
                setLoading(false);
            }
        );
    }, []);

    // Fetch Nearby Hospitals using Mapbox Geocoding API
    const fetchNearbyHospitals = async (lat: number, lng: number) => {
        if (!MAPBOX_TOKEN) {
            console.warn("No Mapbox Token. Skipping Mapbox API call.");
            return;
        }

        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/hospital.json?proximity=${lng},${lat}&types=poi&limit=10&access_token=${MAPBOX_TOKEN}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.features) {
                const places = data.features.map((feature: any) => ({
                    id: feature.id,
                    name: feature.text,
                    address: feature.properties.address || feature.place_name,
                    lng: feature.center[0],
                    lat: feature.center[1],
                }));
                setHospitals(places);
            }
        } catch (error) {
            console.error("Error fetching hospitals:", error);
            toast.error("Failed to load nearby hospitals.");
        }
    };

    // Calculate Route using Mapbox Directions API
    const calculateRoute = async (hospital: any) => {
        if (!userLocation || !MAPBOX_TOKEN) return;

        const start = `${userLocation.lng},${userLocation.lat}`;
        const end = `${hospital.lng},${hospital.lat}`;
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                setRouteGeoJSON({
                    type: 'Feature',
                    properties: {},
                    geometry: route.geometry
                });

                setRouteInfo({
                    distance: `${(route.distance / 1000).toFixed(1)} km`,
                    duration: `${Math.round(route.duration / 60)} mins`
                });
            }
        } catch (error) {
            console.error("Error calculating route:", error);
            toast.error("Failed to calculate route.");
        }
    };

    const handleHospitalSelect = (hospital: any) => {
        setSelectedHospital(hospital);
        calculateRoute(hospital);

        mapRef.current?.flyTo({
            center: [hospital.lng, hospital.lat],
            zoom: 15,
            duration: 2000
        });
    };

    return (
        <div className="relative h-screen w-full bg-slate-50 flex flex-col">
            {/* Header / Back Button */}
            <div className="absolute top-4 left-4 z-50">
                <Button
                    variant="outline"
                    className="bg-white border-slate-200 text-slate-700 shadow-md hover:bg-slate-50 font-medium hover:text-orange-600"
                    onClick={() => onNavigate('home')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative w-full h-full overflow-hidden">
                {!MAPBOX_TOKEN ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10 w-full h-full">
                        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl border border-red-100">
                            <div className="bg-red-50 p-3 rounded-full w-fit mx-auto mb-4">
                                <AlertTriangle className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Mapbox Token Required</h3>
                            <p className="text-slate-500 mb-4">
                                Please add your Mapbox Public Access Token to the <code>.env</code> file to enable the map.
                            </p>
                            <code className="block bg-slate-100 p-3 rounded-lg text-sm text-slate-700 mb-4 text-left">
                                VITE_MAPBOX_TOKEN=pk.eyJ...
                            </code>
                            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => onNavigate('home')}>Go Back</Button>
                        </div>
                    </div>
                ) : (
                    <Map
                        ref={mapRef}
                        {...viewState}
                        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
                        style={{ width: '100%', height: '100%' }}
                        mapStyle="mapbox://styles/mapbox/streets-v12"
                        mapboxAccessToken={MAPBOX_TOKEN}
                    >
                        <NavigationControl position="bottom-right" />
                        <GeolocateControl position="top-right" />

                        {/* User Location Marker */}
                        {userLocation && (
                            <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
                                <div className="relative">
                                    <div className="h-4 w-4 bg-orange-600 rounded-full border-2 border-white shadow-lg pointer-events-none z-10 relative"></div>
                                    <div className="absolute -inset-4 bg-orange-500/30 rounded-full animate-ping"></div>
                                </div>
                            </Marker>
                        )}

                        {/* Hospital Markers */}
                        {hospitals.map((hospital) => (
                            <Marker
                                key={hospital.id}
                                longitude={hospital.lng}
                                latitude={hospital.lat}
                                anchor="bottom"
                                onClick={(e: any) => {
                                    e.originalEvent.stopPropagation();
                                    handleHospitalSelect(hospital);
                                }}
                            >
                                <div className="cursor-pointer group relative">
                                    <div className={`p-2 rounded-full border-2 shadow-sm transition-all ${selectedHospital?.id === hospital.id ? 'bg-red-600 border-white scale-110 z-20' : 'bg-white border-red-500 group-hover:scale-110'}`}>
                                        <MapPin className={`h-5 w-5 ${selectedHospital?.id === hospital.id ? 'text-white' : 'text-red-500'}`} />
                                    </div>
                                    <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-[10px] font-bold text-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        {hospital.name}
                                    </div>
                                </div>
                            </Marker>
                        ))}

                        {/* Route Layer */}
                        {routeGeoJSON && (
                            <Source id="route" type="geojson" data={routeGeoJSON}>
                                <Layer
                                    id="route-line"
                                    type="line"
                                    layout={{
                                        'line-join': 'round',
                                        'line-cap': 'round'
                                    }}
                                    paint={{
                                        'line-color': '#f97316', // Orange-500
                                        'line-width': 4,
                                        'line-opacity': 0.8
                                    }}
                                />
                            </Source>
                        )}
                    </Map>
                )}
            </div>

            {/* Bottom Card - Premium Design */}
            {selectedHospital && (
                <div className="absolute bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-96 z-40">
                    <Card className="border-0 shadow-2xl bg-white/100 backdrop-blur-none rounded-xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 to-amber-500"></div>
                        <CardHeader className="pb-3 pt-4 px-5">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{selectedHospital.name}</h3>
                                    <p className="text-sm text-slate-500 leading-snug">{selectedHospital.address}</p>
                                </div>
                                <div className="bg-orange-50 p-2 rounded-lg shrink-0">
                                    <MapPin className="h-5 w-5 text-orange-600" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="px-5 pb-5">
                            <div className="flex items-center gap-3 mb-5">
                                {routeInfo ? (
                                    <>
                                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold bg-slate-100 px-3 py-1.5 rounded-md text-sm">
                                            <Navigation className="h-3.5 w-3.5 text-slate-500" />
                                            {routeInfo.distance}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-orange-700 font-semibold bg-orange-50 px-3 py-1.5 rounded-md text-sm">
                                            <Clock className="h-3.5 w-3.5 text-orange-500" />
                                            {routeInfo.duration}
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-sm text-slate-400 flex items-center gap-2">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Calculating route...
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    className="bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-200"
                                    onClick={() => {
                                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.lat},${selectedHospital.lng}`);
                                        toast.success("Opening Navigation...");
                                    }}
                                >
                                    <Navigation className="mr-2 h-4 w-4" /> Start
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-orange-600 hover:border-orange-200"
                                    onClick={() => { setSelectedHospital(null); setRouteGeoJSON(null); }}
                                >
                                    Close
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
