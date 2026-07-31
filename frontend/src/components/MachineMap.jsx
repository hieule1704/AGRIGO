import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { categoryIcon, formatVND } from './MachineCard';

// Tọa độ trung tâm mặc định (Tỉnh An Giang / Miền Tây)
const DEFAULT_CENTER = [10.45, 105.25];
const DEFAULT_ZOOM = 10;

// Tạo custom divIcon cho Marker máy nông nghiệp để giao diện mượt mà và hiện đại
function createCustomIcon(slug) {
  const iconEmoji = categoryIcon(slug);
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="
      background: #10B981;
      color: white;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      border: 2px solid white;
      cursor: pointer;
    ">${iconEmoji}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  });
}

// Component tự động điều chỉnh tầm nhìn của Bản đồ khi danh sách máy/khu vực thay đổi
function MapController({ center, zoom, machines }) {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2 });
    } else if (machines && machines.length > 0) {
      const validMachines = machines.filter((m) => m.lat && m.lng);
      if (validMachines.length > 0) {
        const bounds = L.latLngBounds(validMachines.map((m) => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    }
  }, [center, zoom, machines, map]);

  return null;
}

export default function MachineMap({ machines = [], center, zoom = 11, height = '500px' }) {
  // Lọc chỉ lấy các máy có đầy đủ tọa độ lat và lng
  const validMachines = machines.filter((m) => m.lat && m.lng);

  // Tính tâm bản đồ ưu tiên từ props center hoặc máy đầu tiên
  let mapCenter = DEFAULT_CENTER;
  if (center && center[0] && center[1]) {
    mapCenter = center;
  } else if (validMachines.length > 0) {
    mapCenter = [validMachines[0].lat, validMachines[0].lng];
  }

  return (
    <div style={{ height, width: '100%', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'relative', zIndex: 1 }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={center} zoom={zoom} machines={validMachines} />

        {validMachines.map((m) => {
          const cat = m.category_id || {};
          return (
            <Marker
              key={m._id}
              position={[m.lat, m.lng]}
              icon={createCustomIcon(cat.slug)}
            >
              <Popup>
                <div style={{ minWidth: 180, padding: 4 }}>
                  {m.image_url ? (
                    <img
                      src={m.image_url}
                      alt={m.name}
                      style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8, marginBottom: 6 }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: 70, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, borderRadius: 8, marginBottom: 6 }}>
                      {categoryIcon(cat.slug)}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: '#059669', fontWeight: 'bold' }}>{cat.name || 'Máy nông nghiệp'}</div>
                  <h4 style={{ margin: '2px 0 4px 0', fontSize: 14 }}>{m.name}</h4>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>📍 {m.district}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: 6, marginTop: 4 }}>
                    <span style={{ fontWeight: 'bold', color: '#10B981', fontSize: 13 }}>{formatVND(m.price_per_day)}</span>
                    <Link
                      to={`/machine/${m._id}`}
                      style={{
                        background: '#10B981',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: 6,
                        textDecoration: 'none',
                        fontSize: 12,
                        fontWeight: 'bold',
                      }}
                    >
                      Chi tiết ➔
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
