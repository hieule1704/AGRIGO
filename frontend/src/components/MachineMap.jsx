import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { categoryIcon, formatVND } from './MachineCard';
import { resolveImageUrl } from '../api';
import { getRealDrivingRoute } from '../services/routing';

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
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 17px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.3);
      border: 2.5px solid #E8AC1F;
      cursor: pointer;
    ">${iconEmoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function createUserIcon() {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `<div style="
      background: #2563EB;
      color: white;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 19px;
      box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.35), 0 4px 10px rgba(0,0,0,0.25);
      border: 2.5px solid white;
      cursor: pointer;
    ">📍</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  });
}

// Component tự động điều chỉnh tầm nhìn của Bản đồ khi danh sách máy/khu vực/lộ trình thay đổi
function MapController({ center, zoom, machines, userLocation, routePolyline }) {
  const map = useMap();

  useEffect(() => {
    if (routePolyline && routePolyline.length > 1) {
      const bounds = L.latLngBounds(routePolyline);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else if (center && center[0] && center[1]) {
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
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      } else if (pts.length === 1) {
        map.flyTo(pts[0], 12, { duration: 1 });
      }
    }
  }, [center, zoom, machines, userLocation, routePolyline, map]);

  return null;
}

export default function MachineMap({
  machines = [],
  center,
  zoom = 11,
  height = '500px',
  userLocation = null,
  showRoute = true,
}) {
  // Lọc chỉ lấy các máy có đầy đủ tọa độ lat và lng
  const validMachines = machines.filter((m) => m.lat && m.lng);

  // Trạng thái lộ trình đường bộ thực tế (Driving Polyline)
  const [activeRoute, setActiveRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Tính tâm bản đồ ưu tiên từ props center, userLocation hoặc máy đầu tiên
  let mapCenter = DEFAULT_CENTER;
  if (center && center[0] && center[1]) {
    mapCenter = center;
  } else if (userLocation && userLocation.lat && userLocation.lng) {
    mapCenter = [userLocation.lat, userLocation.lng];
  } else if (validMachines.length > 0) {
    mapCenter = [validMachines[0].lat, validMachines[0].lng];
  }

  // Tự động tìm đường đi thực tế nếu chỉ có 1 máy (vd: trang MachineDetail)
  useEffect(() => {
    if (showRoute && userLocation && userLocation.lat && userLocation.lng && validMachines.length === 1) {
      const target = validMachines[0];
      setLoadingRoute(true);
      getRealDrivingRoute([userLocation.lat, userLocation.lng], [target.lat, target.lng])
        .then((res) => {
          if (res) setActiveRoute({ ...res, targetName: target.name });
        })
        .finally(() => setLoadingRoute(false));
    }
  }, [userLocation, validMachines.length, showRoute]);

  // Khi người dùng bấm vào 1 máy trên bản đồ nhiều máy
  function handleSelectMachineRoute(m) {
    if (!userLocation || !userLocation.lat || !userLocation.lng || !m.lat || !m.lng) return;
    setLoadingRoute(true);
    getRealDrivingRoute([userLocation.lat, userLocation.lng], [m.lat, m.lng])
      .then((res) => {
        if (res) setActiveRoute({ ...res, targetName: m.name });
      })
      .finally(() => setLoadingRoute(false));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 18px rgba(0,0,0,0.08)', border: '1px solid var(--line)' }}>
      
      {/* Header thanh lộ trình gọn gàng (Không chèn đè lên bản đồ) */}
      {activeRoute && (
        <div style={{
          background: 'linear-gradient(135deg, #153A2E 0%, #1E5141 100%)',
          color: '#fff',
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          fontSize: 13,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16 }}>🛣️</span>
            <span>
              Đường bộ tới <b>{activeRoute.targetName || 'máy'}</b>:{' '}
              <b style={{ color: 'var(--gold)', fontSize: 14 }}>~{activeRoute.distanceKm} km</b>
            </span>
            <span style={{ opacity: 0.9, fontSize: 12.5, background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: 999 }}>
              ⏱️ ~{activeRoute.durationMin} phút di chuyển
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveRoute(null)}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 12,
              padding: '3px 10px',
              borderRadius: 6,
              fontWeight: 'bold',
            }}
          >
            ✖ Ẩn lộ trình
          </button>
        </div>
      )}

      {loadingRoute && (
        <div style={{
          background: '#EFF6FF',
          color: '#2563EB',
          padding: '6px 14px',
          fontSize: 12,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          borderBottom: '1px solid #BFDBFE',
        }}>
          📡 Đang tính toán đường đi xe chạy thực tế...
        </div>
      )}

      <div style={{ height, width: '100%', position: 'relative' }}>
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          zoomControl={false}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Di chuyển nút Zoom [+] [-] xuống góc dưới phải gọn gàng */}
          <ZoomControl position="bottomright" />

          <MapController
            center={center}
            zoom={zoom}
            machines={validMachines}
            userLocation={userLocation}
            routePolyline={activeRoute?.polyline}
          />

          {/* Vẽ Lộ trình đường bộ thực tế (Polyline) */}
          {activeRoute?.polyline && activeRoute.polyline.length > 0 && (
            <Polyline
              positions={activeRoute.polyline}
              pathOptions={{
                color: '#2563EB',
                weight: 5,
                opacity: 0.85,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          )}

          {/* Vị trí của Nông dân (User GPS Location) */}
          {userLocation && userLocation.lat && userLocation.lng && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
              <Popup>
                <div style={{ padding: 4, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, marginBottom: 2 }}>📍</div>
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

            return (
              <Marker
                key={m._id}
                position={[m.lat, m.lng]}
                icon={createCustomIcon(cat.slug)}
                eventHandlers={{
                  click: () => handleSelectMachineRoute(m),
                }}
              >
                <Popup>
                  <div style={{ minWidth: 210, padding: 4 }}>
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
                    
                    {userLocation && (
                      <button
                        type="button"
                        onClick={() => handleSelectMachineRoute(m)}
                        style={{
                          background: '#EFF6FF',
                          color: '#2563EB',
                          border: '1px solid #BFDBFE',
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 'bold',
                          width: '100%',
                          cursor: 'pointer',
                          marginBottom: 8,
                          textAlign: 'center',
                        }}
                      >
                        🛣️ Xem đường đi thực tế tới máy
                      </button>
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
    </div>
  );
}

