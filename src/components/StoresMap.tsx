import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Phone, Star } from 'lucide-react';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Store {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  phone?: string | null;
  rating?: number | null;
  address?: string | null;
  is_active?: boolean;
}

interface StoresMapProps {
  stores: Store[];
}

export default function StoresMap({ stores }: StoresMapProps) {
  // Filter stores that have valid coordinates
  const validStores = stores.filter(
    (store) => store.latitude && store.longitude && store.is_active !== false
  );

  // Default center (Riyadh, Saudi Arabia)
  const defaultCenter: [number, number] = [24.7136, 46.6753];
  
  // Calculate center based on stores or use default
  const center: [number, number] = validStores.length > 0
    ? [
        validStores.reduce((sum, s) => sum + (s.latitude || 0), 0) / validStores.length,
        validStores.reduce((sum, s) => sum + (s.longitude || 0), 0) / validStores.length
      ]
    : defaultCenter;

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-border shadow-lg">
      <MapContainer
        center={center}
        zoom={validStores.length > 0 ? 12 : 6}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validStores.map((store) => (
          <Marker 
            key={store.id}
            position={[store.latitude!, store.longitude!]}
          >
            <Popup>
              <div className="min-w-[200px] p-2">
                <h3 className="font-bold text-lg mb-3">{store.name}</h3>
                
                {store.address && (
                  <div className="flex items-start gap-2 mb-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{store.address}</span>
                  </div>
                )}
                
                {store.phone && (
                  <div className="flex items-center gap-2 mb-2 text-sm">
                    <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                    <a 
                      href={`tel:${store.phone}`}
                      className="text-primary hover:underline"
                    >
                      {store.phone}
                    </a>
                  </div>
                )}
                
                {store.rating && (
                  <div className="flex items-center gap-2 mb-3 text-sm">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{store.rating.toFixed(1)}</span>
                  </div>
                )}
                
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors w-full justify-center font-medium"
                >
                  <MapPin className="h-4 w-4" />
                  عرض المسار على Google Maps
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {validStores.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[1000] pointer-events-none">
          <p className="text-muted-foreground">لا توجد متاجر بإحداثيات صالحة لعرضها على الخريطة</p>
        </div>
      )}
    </div>
  );
}
