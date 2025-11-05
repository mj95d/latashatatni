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
        scrollWheelZoom: true,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        minZoom: 5
      }).addTo(map);

      // Add markers
      validStores.forEach((store) => {
        const marker = L.marker([store.latitude!, store.longitude!]).addTo(map);
        
        // Create popup content
        const popupContent = `
          <div style="min-width: 220px; padding: 12px; font-family: 'Cairo', sans-serif; direction: rtl;">
            <h3 style="font-weight: 700; font-size: 1.125rem; margin-bottom: 12px; color: #1e293b;">${store.name}</h3>
            ${store.address ? `
              <div style="display: flex; align-items: start; gap: 8px; margin-bottom: 10px; font-size: 0.875rem;">
                <span style="flex-shrink: 0;">📍</span>
                <span style="color: #64748b; line-height: 1.5;">${store.address}</span>
              </div>
            ` : ''}
            ${store.phone ? `
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 0.875rem;">
                <span>📞</span>
                <a href="tel:${store.phone}" style="color: #3b82f6; text-decoration: none; font-weight: 500;">${store.phone}</a>
              </div>
            ` : ''}
            ${store.rating && store.rating > 0 ? `
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 0.875rem;">
                <span>⭐</span>
                <span style="font-weight: 600; color: #f59e0b;">${store.rating.toFixed(1)}</span>
              </div>
            ` : ''}
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}"
              target="_blank"
              rel="noopener noreferrer"
              style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.875rem; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: 600; width: 100%; transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);"
              onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(59, 130, 246, 0.4)';"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(59, 130, 246, 0.3)';"
            >
              🗺️ عرض المسار
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
