import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Navigation, MapPin, Clock, Search } from 'lucide-react';
import { toast } from 'sonner';

// Import Leaflet CSS (Must happen in main entry usually, but ensuring it works here)
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Default Icon Issue in Vite/Webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// Custom Icons
const hospitalIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063327.png', // Medical cross icon
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
});

const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/17004/17004037.png', // Blue user dot
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
});

// Component to handle map center updates
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 14);
    }, [center, map]);
    return null;
}

export function NearestHospitalPage({ onNavigate }: { onNavigate: (page: string) => void }) {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
    const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
    const [loading, setLoading] = useState(true);

    // Get User Location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const pos: [number, number] = [latitude, longitude];
                    setUserLocation(pos);
                    fetchNearbyHospitals(latitude, longitude);
                    setLoading(false);
                },
                () => {
                    toast.error("Location access denied. Using default location.");
                    // Default to Dhaka for demo
                    const defaultPos: [number, number] = [23.8103, 90.4125];
                    setUserLocation(defaultPos);
                    fetchNearbyHospitals(defaultPos[0], defaultPos[1]);
                    setLoading(false);
                }
            );
        } else {
            toast.error("Geolocation not supported.");
            setLoading(false);
        }
    }, []);

    // Fetch Hospitals from Overpass API (OpenStreetMap)
    const fetchNearbyHospitals = async (lat: number, lng: number) => {
        const query = `
            [out:json];
            (
              node["amenity"="hospital"](around:5000,${lat},${lng});
              way["amenity"="hospital"](around:5000,${lat},${lng});
            );
            out center;
        `;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            const places = data.elements.map((el: any) => ({
                id: el.id,
                name: el.tags.name || "Unknown Hospital",
                lat: el.lat || el.center?.lat,
                lng: el.lon || el.center?.lon,
                address: el.tags['addr:street'] || "Address not available"
            })).filter((el: any) => el.lat && el.lng); // Ensure coords exist

            setHospitals(places);
            if (places.length === 0) toast('No hospitals found nearby (5km radius).');
        } catch (error) {
            console.error("Overpass API Error:", error);
            toast.error("Failed to fetch nearby hospitals.");
        }
    };

    // Calculate Route using OSRM (Open Source Routing Machine)
    const calculateRoute = async (hospital: any) => {
        if (!userLocation) return;

        const start = `${userLocation[1]},${userLocation[0]}`; // Lng,Lat
        const end = `${hospital.lng},${hospital.lat}`;

        const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.code === 'Ok') {
                const route = data.routes[0];
                const coords = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]); // Flip to Lat,Lng
                setRouteCoords(coords);

                // Duration is in seconds, Distance in meters
                const durationMins = Math.round(route.duration / 60);
                const distanceKm = (route.distance / 1000).toFixed(1);

                setRouteInfo({
                    distance: `${distanceKm} km`,
                    duration: `~${durationMins} mins`
                });
            } else {
                toast.error("Could not calculate route.");
            }
        } catch (error) {
            console.error("OSRM Error:", error);
            toast.error("Routing service unavailable.");
        }
    };

    const handleHospitalSelect = (hospital: any) => {
        setSelectedHospital(hospital);
        calculateRoute(hospital);
    };

    return (
        <div className="relative h-screen w-full bg-gray-50">
            {/* Back Button */}
            <div className="absolute top-4 left-4 z-[1000]">
                <Button
                    variant="outline"
                    className="bg-white/90 backdrop-blur shadow-md hover:bg-white"
                    onClick={() => onNavigate('home')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>
            </div>

            {loading ? (
                <div className="h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                        <p className="text-gray-500 font-medium">Locating & Loading Maps...</p>
                    </div>
                </div>
            ) : (
                <MapContainer
                    center={userLocation || [23.8103, 90.4125]}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                >
                    {/* Map Tiles (OpenStreetMap) */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Auto-center map when user location changes */}
                    {userLocation && <MapUpdater center={userLocation} />}

                    {/* User Marker */}
                    {userLocation && (
                        <Marker position={userLocation} icon={userIcon}>
                            <Popup>You are here</Popup>
                        </Marker>
                    )}

                    {/* Hospital Markers */}
                    {hospitals.map((hospital) => (
                        <Marker
                            key={hospital.id}
                            position={[hospital.lat, hospital.lng]}
                            icon={hospitalIcon}
                            eventHandlers={{
                                click: () => handleHospitalSelect(hospital),
                            }}
                        >
                            <Popup>
                                <strong>{hospital.name}</strong><br />
                                <span className="text-xs text-gray-500">{hospital.address}</span>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Route Polyline */}
                    {routeCoords.length > 0 && (
                        <Polyline
                            positions={routeCoords}
                            color="#dc2626"
                            weight={5}
                            opacity={0.8}
                            dashArray="10, 10"
                        />
                    )}
                </MapContainer>
            )}

            {/* Bottom Floating Card */}
            {selectedHospital && (
                <div className="absolute bottom-8 left-0 right-0 px-4 z-[1000] flex justify-center pointer-events-none">
                    <Card className="w-full max-w-md shadow-2xl bg-white/90 backdrop-blur-lg border-t-4 border-t-red-500 animate-in slide-in-from-bottom duration-300 pointer-events-auto">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="bg-red-100 p-1 rounded-md">
                                            <MapPin className="h-4 w-4 text-red-600" />
                                        </div>
                                        <CardTitle className="text-lg font-bold text-gray-800">{selectedHospital.name}</CardTitle>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{selectedHospital.address}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 mb-4">
                                {routeInfo ? (
                                    <>
                                        <div className="flex items-center gap-1 text-red-600 font-semibold bg-red-50 px-3 py-1 rounded-full">
                                            <Navigation className="h-4 w-4" />
                                            {routeInfo.distance}
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full">
                                            <Clock className="h-4 w-4" />
                                            {routeInfo.duration}
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-sm text-gray-400 italic flex items-center gap-2">
                                        <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                        Calculating route...
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200"
                                    onClick={() => {
                                        // Open standard Google Maps or OS Maps for real navigation
                                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.lat},${selectedHospital.lng}`);
                                        toast.success("Opening Navigation...");
                                    }}
                                >
                                    <Navigation className="mr-2 h-4 w-4" /> Go Now
                                </Button>
                                <Button variant="outline" onClick={() => { setSelectedHospital(null); setRouteCoords([]); }}>
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
