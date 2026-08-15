import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { categoryIcon, formatVND } from './MachineCard';
import { resolveImageUrl } from '../api';

// Tọa độ trung tâm mặc định (Tỉnh An Giang / Miền Tây)
const DEFAULT_CENTER = [10.45, 105.25];
const DEFAULT_ZOOM = 10;

// Tạo custom divIcon cho Marker máy nông nghiệp để giao diện mượt mà và hiện đại
function createCustomIcon(slug) {
  const iconEmoji = categoryIcon(slug);
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="
      background: #153A2E;
      color: white;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      border: 2.5px solid #E8AC1F;
      cursor: pointer;
    ">${iconEmoji}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  });
}

function createUserIcon() {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `<div style="
      background: #2563EB;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.35), 0 4px 12px rgba(0,0,0,0.3);
      border: 3px solid white;
      cursor: pointer;
    ">📍</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
}

// Hàm tính khoảng cách km
function calcDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Component tự động điều chỉnh tầm nhìn của Bản đồ khi danh sách máy/khu vực thay đổi
function MapController({ center, zoom, machines, userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2 });
    } else {
      const pts = [];
      if (userLocation && userLocation.lat && userLocation.lng) {
        pts.push([userLocation.lat, userLocation.lng]);
      }
      if (machines && machines.length > 0) {
        machines.forEach((m) => {
          if (m.lat && m.lng) pts.push([m.lat, m.lng]);
        });
      }
      if (pts.length > 1) {
        const bounds = L.latLngBounds(pts);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      } else if (pts.length === 1) {
        map.flyTo(pts[0], 12, { duration: 1 });
      }
    }
  }, [center, zoom, machines, userLocation, map]);

  return null;
}

export default function MachineMap({ machines = [], center, zoom = 11, height = '500px', userLocation = null }) {
  // Lọc chỉ lấy các máy có đầy đủ tọa độ lat và lng
  const validMachines = machines.filter((m) => m.lat && m.lng);

  // Tính tâm bản đồ ưu tiên từ props center, userLocation hoặc máy đầu tiên
  let mapCenter = DEFAULT_CENTER;
  if (center && center[0] && center[1]) {
    mapCenter = center;
  } else if (userLocation && userLocation.lat && userLocation.lng) {
    mapCenter = [userLocation.lat, userLocation.lng];
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

        <MapController center={center} zoom={zoom} machines={validMachines} userLocation={userLocation} />

        {/* Vị trí của Nông dân (User GPS Location) */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
            <Popup>
              <div style={{ padding: 4, textAlign: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 2 }}>📍</div>
                <b style={{ color: '#2563EB', fontSize: 13 }}>Vị trí của bạn ({userLocation.name || 'Nông dân'})</b>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                  Tọa độ: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Danh sách máy nông nghiệp */}
        {validMachines.map((m) => {
          const cat = m.category_id || {};
          const distKm = userLocation && userLocation.lat && userLocation.lng
            ? calcDistance(userLocation.lat, userLocation.lng, m.lat, m.lng)
            : null;

          return (
            <Marker
              key={m._id}
              position={[m.lat, m.lng]}
              icon={createCustomIcon(cat.slug)}
            >
              <Popup>
                <div style={{ minWidth: 200, padding: 4 }}>
                  {m.image_url ? (
                    <img
                      src={resolveImageUrl(m.image_url)}
                      alt={m.name}
                      style={{ width: '100%', height: 95, objectFit: 'cover', borderRadius: 8, marginBottom: 6 }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: 75, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, borderRadius: 8, marginBottom: 6 }}>
                      {categoryIcon(cat.slug)}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 'bold', textTransform: 'uppercase' }}>{cat.name || 'Máy nông nghiệp'}</div>
                  <h4 style={{ margin: '2px 0 4px 0', fontSize: 14.5 }}>{m.name}</h4>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>📍 {m.district} {m.address_detail ? `· ${m.address_detail}` : ''}</div>
                  
                  {distKm !== null && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: distKm <= 10 ? '#E6F4EA' : distKm <= 30 ? '#FEF7E0' : '#F1F3F4',
                      color: distKm <= 10 ? '#137333' : distKm <= 30 ? '#B06000' : '#3C4043',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: 'bold',
                      marginBottom: 8,
                    }}>
                      🧭 Ước tính cách bạn: ~{distKm} km
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #ddd', paddingTop: 8, marginTop: 4 }}>
                    <span style={{ fontWeight: '800', color: 'var(--green-deep)', fontSize: 13.5 }}>{formatVND(m.price_per_day)}</span>
                    <Link
                      to={`/machine/${m._id}`}
                      style={{
                        background: 'var(--gold)',
                        color: 'var(--green-deep)',
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
