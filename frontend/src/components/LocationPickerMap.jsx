import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const pinIcon = L.divIcon({
  className: 'custom-pin-marker',
  html: `<div style="
    background: #C1432D;
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.35);
    border: 3px solid white;
    cursor: pointer;
  ">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function MapEventsHandler({ onSelectLocation, center }) {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 13, { duration: 1 });
    }
  }, [center, map]);

  useMapEvents({
    click(e) {
      onSelectLocation(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export default function LocationPickerMap({ position, onSelectLocation, center, height = '260px' }) {
  const defaultCenter = center || [10.45, 105.25];

  return (
    <div style={{ height, width: '100%', borderRadius: 12, overflow: 'hidden', border: '2px solid var(--line)', position: 'relative', marginTop: 8 }}>
      <MapContainer
        center={position && position[0] ? position : defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEventsHandler onSelectLocation={onSelectLocation} center={center} />

        {position && position[0] && position[1] && (
          <Marker position={position} icon={pinIcon}>
            <Popup>
              📍 Vị trí máy bạn chọn:<br />
              <b>{Number(position[0]).toFixed(5)}, {Number(position[1]).toFixed(5)}</b>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <div style={{ position: 'absolute', bottom: 8, left: 8, zIndex: 1000, background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 'bold', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
        👉 Nhấp vào bất kỳ điểm nào trên bản đồ để chọn tọa độ đặt máy
      </div>
    </div>
  );
}
