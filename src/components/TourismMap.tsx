import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
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
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only create map if container exists and no map is already created
    if (!containerRef.current || mapRef.current) return;

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

    try {
      // Initialize map with container ref
      const map = L.map(containerRef.current, {
        center,
        zoom: validPlaces.length > 0 ? 10 : 6,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add markers
      validPlaces.forEach((place) => {
        const marker = L.marker([place.latitude!, place.longitude!]).addTo(map);
        
        // Create popup content
        const popupContent = `
          <div style="min-width: 200px; padding: 8px;">
            <h3 style="font-weight: bold; font-size: 1.125rem; margin-bottom: 8px;">${place.name}</h3>
            ${place.description ? `
              <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 8px;">
                ${place.description}
              </p>
            ` : ''}
            ${place.category ? `
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 0.875rem;">
                <span>🏪</span>
                <span style="color: #64748b;">${place.category}</span>
              </div>
            ` : ''}
            ${place.city_name ? `
              <div style="display: flex; align-items: center; gap: 8px; font-size: 0.875rem;">
                <span>📍</span>
                <span style="font-weight: 500;">${place.city_name}</span>
              </div>
            ` : ''}
          </div>
        `;
        
        marker.bindPopup(popupContent);
        markersRef.current.push(marker);
      });

      mapRef.current = map;
    } catch (error) {
      console.error('Error creating tourism map:', error);
    }

    // Cleanup
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [places]);

  const validPlaces = places.filter(
    (place) => place.latitude && place.longitude
  );

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-border shadow-lg relative">
      <div 
        ref={containerRef}
        style={{ height: '100%', width: '100%' }} 
      />
      
      {validPlaces.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[1000] pointer-events-none">
          <p className="text-muted-foreground">لا توجد أماكن سياحية بإحداثيات صالحة لعرضها على الخريطة</p>
        </div>
      )}
    </div>
  );
}
