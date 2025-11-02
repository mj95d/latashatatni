import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Set custom default marker icon
const defaultIcon = L.icon({
  iconUrl: '/marker.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
});
(L.Marker as any).prototype.options.icon = defaultIcon;

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

export default function MapPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only create map if container exists and no map is already created
    if (!containerRef.current) return;
    if ((containerRef.current as any)._leaflet_id) return;
    if (mapRef.current) return;

    // Initialize map
    const center: [number, number] = latitude && longitude 
      ? [latitude, longitude]
      : [24.7136, 46.6753]; // Riyadh default

    try {
      const map = L.map(containerRef.current, {
        center,
        zoom: 12,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      // Add click handler
      map.on('click', (e: L.LeafletMouseEvent) => {
        onLocationChange(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
    } catch (error) {
      console.error('Error creating map picker:', error);
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker when location changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Add new marker if location exists
    if (latitude && longitude) {
      markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);
      mapRef.current.setView([latitude, longitude], 12);
    }
  }, [latitude, longitude]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="w-4 h-4 text-primary" />
        <span>انقر على الخريطة لتحديد موقع المتجر</span>
      </div>
      
      <div className="h-80 w-full rounded-lg overflow-hidden shadow-lg border-2 border-border">
        <div 
          ref={containerRef}
          style={{ height: '100%', width: '100%' }} 
        />
      </div>
      
      {latitude && longitude && (
        <div className="flex items-center gap-2 text-sm bg-primary/10 px-4 py-2 rounded-lg">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-primary font-medium">
            الموقع: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>
        </div>
      )}
    </div>
  );
}
