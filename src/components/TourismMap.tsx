import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Store } from 'lucide-react';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface TourismPlace {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  description?: string | null;
  category?: string | null;
  city_name?: string | null;
}

interface TourismMapProps {
  places: TourismPlace[];
}

export default function TourismMap({ places }: TourismMapProps) {
  // Filter places that have valid coordinates
  const validPlaces = places.filter(
    (place) => place.latitude && place.longitude
  );

  // Default center (Riyadh, Saudi Arabia)
  const defaultCenter: [number, number] = [24.7136, 46.6753];
  
  // Calculate center based on places or use default
  const center: [number, number] = validPlaces.length > 0
    ? [
        validPlaces.reduce((sum, p) => sum + (p.latitude || 0), 0) / validPlaces.length,
        validPlaces.reduce((sum, p) => sum + (p.longitude || 0), 0) / validPlaces.length
      ]
    : defaultCenter;

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-border shadow-lg">
      <MapContainer
        center={center}
        zoom={validPlaces.length > 0 ? 10 : 6}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validPlaces.map((place) => (
          <Marker 
            key={place.id}
            position={[place.latitude!, place.longitude!]}
          >
            <Popup>
              <div className="min-w-[200px] p-2">
                <h3 className="font-bold text-lg mb-2">{place.name}</h3>
                
                {place.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {place.description}
                  </p>
                )}
                
                {place.category && (
                  <div className="flex items-center gap-2 mb-2 text-sm">
                    <Store className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{place.category}</span>
                  </div>
                )}
                
                {place.city_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-medium">{place.city_name}</span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {validPlaces.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[1000] pointer-events-none">
          <p className="text-muted-foreground">لا توجد أماكن سياحية بإحداثيات صالحة لعرضها على الخريطة</p>
        </div>
      )}
    </div>
  );
}
