import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Set custom default marker icon
const defaultIcon = L.icon({
  iconUrl: '/marker.png',
  iconSize: [30, 45],
  iconAnchor: [15, 45],
});
(L.Marker as any).prototype.options.icon = defaultIcon;

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
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only create map if container exists and no map is already created
    if (!containerRef.current) return;
    if ((containerRef.current as any)._leaflet_id) return;
    if (mapRef.current) return;

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

    try {
      // Initialize map with container ref
      const map = L.map(containerRef.current, {
        center,
        zoom: validStores.length > 0 ? 12 : 6,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add markers
      validStores.forEach((store) => {
        const marker = L.marker([store.latitude!, store.longitude!]).addTo(map);
        
        // Create popup content
        const popupContent = `
          <div style="min-width: 200px; padding: 8px;">
            <h3 style="font-weight: bold; font-size: 1.125rem; margin-bottom: 12px;">${store.name}</h3>
            ${store.address ? `
              <div style="display: flex; align-items: start; gap: 8px; margin-bottom: 8px; font-size: 0.875rem;">
                <span>📍</span>
                <span style="color: #64748b;">${store.address}</span>
              </div>
            ` : ''}
            ${store.phone ? `
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 0.875rem;">
                <span>📞</span>
                <a href="tel:+966532402020" style="color: #3b82f6; text-decoration: none;">+966532402020</a>
              </div>
            ` : ''}
            ${store.rating ? `
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 0.875rem;">
                <span>⭐</span>
                <span style="font-weight: 500;">${store.rating.toFixed(1)}</span>
              </div>
            ` : ''}
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}"
              target="_blank"
              rel="noopener noreferrer"
              style="display: inline-flex; align-items: center; gap: 8px; font-size: 0.875rem; background: #3b82f6; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-weight: 500; width: 100%; justify-content: center;"
            >
              📍 عرض المسار على Google Maps
            </a>
          </div>
        `;
        
        marker.bindPopup(popupContent);
        markersRef.current.push(marker);
      });

      mapRef.current = map;
    } catch (error) {
      console.error('Error creating map:', error);
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
  }, [stores]);

  const validStores = stores.filter(
    (store) => store.latitude && store.longitude && store.is_active !== false
  );

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-border shadow-lg relative">
      <div 
        ref={containerRef}
        style={{ height: '100%', width: '100%' }} 
      />
      
      {validStores.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[1000] pointer-events-none">
          <p className="text-muted-foreground">لا توجد متاجر بإحداثيات صالحة لعرضها على الخريطة</p>
        </div>
      )}
    </div>
  );
}
