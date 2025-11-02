import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

function LocationSelector({ latitude, longitude, onLocationChange }: LocationPickerProps) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return latitude && longitude ? (
    <Marker position={[latitude, longitude]} />
  ) : null;
}

export default function MapPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
  const center: [number, number] = latitude && longitude 
    ? [latitude, longitude]
    : [24.7136, 46.6753]; // Riyadh default

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="w-4 h-4 text-primary" />
        <span>انقر على الخريطة لتحديد موقع المتجر</span>
      </div>
      
      <div className="h-80 w-full rounded-lg overflow-hidden shadow-lg border-2 border-border">
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationSelector 
            latitude={latitude} 
            longitude={longitude} 
            onLocationChange={onLocationChange}
          />
        </MapContainer>
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
