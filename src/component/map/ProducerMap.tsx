import React, { useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap, Popup } from "react-leaflet";
import { Icon, LatLngBounds } from "leaflet";
import { MapPin } from "lucide-react";
import type { ProducerProfile } from "../../pages/producer/ListProducerPage";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Vite
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";

// Fix default icon issue with Vite
delete (Icon.Default as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
});

interface ProducerMapProps {
  producers: ProducerProfile[];
  center?: { lat: number; lng: number };
  radius?: number;
  selectedProducerId?: number;
  onMarkerClick?: (producer: ProducerProfile) => void;
  mapContainerStyle?: React.CSSProperties;
}

const defaultCenter: [number, number] = [10.8231, 106.6297]; // Ho Chi Minh City default

// Component to fit map bounds to markers
const MapBoundsFitter: React.FC<{
  producers: ProducerProfile[];
  center?: { lat: number; lng: number };
  radius?: number;
}> = ({ producers, center, radius }) => {
  const map = useMap();

  React.useEffect(() => {
    // Nếu có center (vị trí tìm kiếm), ưu tiên hiển thị center với zoom phù hợp
    if (center) {
      let zoomLevel = map.getZoom();
      
      // Tính zoom dựa trên radius nếu có
      if (radius && radius > 0) {
        if (radius < 10) zoomLevel = 13;
        else if (radius < 25) zoomLevel = 12;
        else if (radius < 50) zoomLevel = 11;
        else if (radius < 100) zoomLevel = 10;
        else if (radius < 200) zoomLevel = 9;
        else if (radius < 500) zoomLevel = 8;
        else zoomLevel = 7;
      } else {
        // Nếu không có radius, dùng zoom hiện tại hoặc zoom mặc định
        zoomLevel = map.getZoom() || 10;
      }
      
      map.setView([center.lat, center.lng], zoomLevel);
      return;
    }

    // Nếu không có center, fit bounds dựa trên producers
    if (producers.length === 0) return;

    const bounds = new LatLngBounds(
      producers.map((p) => [p.latitude!, p.longitude!] as [number, number])
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [map, producers, center, radius]);

  return null;
};

const ProducerMap: React.FC<ProducerMapProps> = ({
  producers,
  center,
  radius,
  selectedProducerId,
  onMarkerClick,
  mapContainerStyle = {
    width: "100%",
    height: "100%",
    borderRadius: "12px",
  },
}) => {
  // Filter producers that have valid coordinates
  const producersWithCoords = useMemo(
    () =>
      producers.filter(
        (p) =>
          p.latitude !== undefined &&
          p.longitude !== undefined &&
          p.latitude !== null &&
          p.longitude !== null &&
          !isNaN(p.latitude) &&
          !isNaN(p.longitude)
      ),
    [producers]
  );

  // Calculate map center
  const mapCenter = useMemo((): [number, number] => {
    if (center) return [center.lat, center.lng];
    if (producersWithCoords.length === 0) return defaultCenter;

    // Calculate center from all producer locations
    const avgLat =
      producersWithCoords.reduce((sum, p) => sum + (p.latitude || 0), 0) /
      producersWithCoords.length;
    const avgLng =
      producersWithCoords.reduce((sum, p) => sum + (p.longitude || 0), 0) /
      producersWithCoords.length;

    return [avgLat, avgLng];
  }, [center, producersWithCoords]);

  // Calculate zoom level based on producers or radius
  const calculateZoom = useCallback(() => {
    if (radius && radius < 50) return 11;
    if (radius && radius < 200) return 9;
    if (radius && radius < 500) return 8;
    if (producersWithCoords.length === 1) return 12;
    if (producersWithCoords.length <= 5) return 10;
    return 8;
  }, [radius, producersWithCoords.length]);

  const handleMarkerClick = useCallback(
    (producer: ProducerProfile) => {
      if (onMarkerClick) {
        onMarkerClick(producer);
      }
    },
    [onMarkerClick]
  );

  // Create custom icons
  const createCustomIcon = useCallback(
    (isSelected: boolean) => {
      const size = isSelected ? [40, 50] : [36, 46];
      const anchor = isSelected ? [20, 50] : [18, 46];

      const svgString = isSelected
        ? `<svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0C8.954 0 0 8.954 0 20c0 14.5 20 30 20 30s20-15.5 20-30C40 8.954 31.046 0 20 0z" fill="#9333ea" stroke="#ffffff" stroke-width="2"/>
            <circle cx="20" cy="20" r="8" fill="#ffffff"/>
          </svg>`
        : `<svg width="36" height="46" viewBox="0 0 36 46" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 0C8.059 0 0 8.059 0 18c0 13.5 18 28 18 28s18-14.5 18-28C36 8.059 27.941 0 18 0z" fill="#f97316" stroke="#ffffff" stroke-width="1.5"/>
            <circle cx="18" cy="18" r="6" fill="#ffffff"/>
          </svg>`;

      return new Icon({
        iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgString)}`,
        iconSize: size as [number, number],
        iconAnchor: anchor as [number, number],
        popupAnchor: [0, -(anchor[1] as number)],
      });
    },
    []
  );

  // Chỉ hiển thị thông báo lỗi khi không có center VÀ không có producer nào có tọa độ
  // Nếu có center (vị trí GPS), luôn hiển thị bản đồ ngay cả khi không có producer
  if (producersWithCoords.length === 0 && !center) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="text-center text-gray-400 p-6">
          <MapPin size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-lg font-semibold mb-2">Không có vị trí để hiển thị</p>
          <p className="text-sm">Các producer chưa có thông tin tọa độ</p>
        </div>
      </div>
    );
  }

  return (
    <div style={mapContainerStyle} className="relative">
      <MapContainer
        center={mapCenter}
        zoom={center ? 12 : calculateZoom()}
        style={{ width: "100%", height: "100%", borderRadius: "12px" }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsFitter producers={producersWithCoords} center={center} radius={radius} />

        {/* Marker cho vị trí GPS của người dùng (tâm bán kính) */}
        {center && (
          <Marker
            position={[center.lat, center.lng]}
            icon={new Icon({
              iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="14" fill="#10b981" stroke="#ffffff" stroke-width="3"/>
                  <circle cx="16" cy="16" r="6" fill="#ffffff"/>
                </svg>
              `)}`,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            })}
          >
            <Popup>Vị trí của bạn</Popup>
          </Marker>
        )}

        {/* Draw circle if radius is provided - hiển thị bán kính tìm kiếm */}
        {center && radius && radius > 0 && radius < 10000 && (
          <Circle
            center={[center.lat, center.lng]}
            radius={radius * 1000} // Convert km to meters
            pathOptions={{
              fillColor: "#9333ea",
              fillOpacity: 0.15,
              color: "#9333ea",
              weight: 3,
              opacity: 0.7,
              dashArray: "10, 5", // Dashed border for better visibility
            }}
          />
        )}

        {/* Markers for each producer */}
        {producersWithCoords.map((producer) => {
          const isSelected = selectedProducerId === producer.userId;
          return (
            <Marker
              key={producer.userId}
              position={[producer.latitude!, producer.longitude!]}
              icon={createCustomIcon(isSelected)}
              eventHandlers={{
                click: () => handleMarkerClick(producer),
              }}
            >
              {/* Optional: Add popup */}
              {/* <Popup>{producer.fullName}</Popup> */}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default ProducerMap;
