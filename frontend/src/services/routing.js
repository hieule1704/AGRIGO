// Service tính khoảng cách & lộ trình đường bộ thực tế (Real Road Driving Routing)
// Sử dụng Open Source Routing Machine (OSRM) kết nối mạng lưới giao thông OpenStreetMap

const routeCache = new Map();

// Công thức Haversine dự phòng (km)
export function calculateHaversineKm(lat1, lon1, lat2, lon2) {
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

/**
 * Lấy lộ trình đường bộ thực tế giữa 2 điểm (km, thời gian phút, và danh sách tọa độ vẽ đường đi Polyline)
 * @param {[number, number]} fromCoords - [lat, lng]
 * @param {[number, number]} toCoords - [lat, lng]
 */
export async function getRealDrivingRoute(fromCoords, toCoords) {
  if (!fromCoords || !toCoords || !fromCoords[0] || !toCoords[0]) return null;

  const cacheKey = `${fromCoords[0].toFixed(4)},${fromCoords[1].toFixed(4)}_${toCoords[0].toFixed(4)},${toCoords[1].toFixed(4)}`;
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey);
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromCoords[1]},${fromCoords[0]};${toCoords[1]},${toCoords[0]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM routing network error');
    const data = await res.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const best = data.routes[0];
      const distanceKm = Math.round((best.distance / 1000) * 10) / 10;
      const durationMin = Math.max(1, Math.round(best.duration / 60));
      // Chuyển đổi GeoJSON [lng, lat] sang Leaflet [lat, lng]
      const polyline = best.geometry.coordinates.map((c) => [c[1], c[0]]);

      const result = {
        distanceKm,
        durationMin,
        polyline,
        isRealRoad: true,
      };

      routeCache.set(cacheKey, result);
      return result;
    }
  } catch (e) {
    console.warn('Không thể kết nối OSRM API, dùng tính toán ước lượng đường bộ:', e);
  }

  // Fallback: Haversine * 1.35 (Hệ số uốn lượn đường bộ Miền Tây)
  const airKm = calculateHaversineKm(fromCoords[0], fromCoords[1], toCoords[0], toCoords[1]);
  if (airKm === null) return null;
  const estRoadKm = Math.round(airKm * 1.35 * 10) / 10;
  const estDuration = Math.max(2, Math.round(estRoadKm * 1.8));

  const fallbackResult = {
    distanceKm: estRoadKm,
    durationMin: estDuration,
    polyline: [fromCoords, toCoords],
    isRealRoad: false,
  };
  routeCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}

/**
 * Lấy khoảng cách đường bộ hàng loạt cho danh sách máy (Batch Distance Matrix)
 * @param {{ lat: number, lng: number }} userLoc 
 * @param {Array} machines 
 */
export async function getBatchRoadDistances(userLoc, machines) {
  if (!userLoc || !userLoc.lat || !userLoc.lng || !machines || machines.length === 0) {
    return {};
  }

  const results = {};
  const validMachines = machines.filter((m) => m && ((m.lat && m.lng) || m.district));

  // Kiểm tra cache trước
  const needFetch = [];
  validMachines.forEach((m) => {
    const mLat = m.lat || null;
    const mLng = m.lng || null;
    if (mLat && mLng) {
      const cKey = `${userLoc.lat.toFixed(4)},${userLoc.lng.toFixed(4)}_${mLat.toFixed(4)},${mLng.toFixed(4)}`;
      if (routeCache.has(cKey)) {
        results[m._id] = routeCache.get(cKey);
      } else {
        needFetch.push(m);
      }
    }
  });

  if (needFetch.length === 0) return results;

  // Gọi OSRM Table Service cho các điểm chưa có trong cache
  try {
    const coordsStr = `${userLoc.lng},${userLoc.lat};` + needFetch.map((m) => `${m.lng},${m.lat}`).join(';');
    const url = `https://router.project-osrm.org/table/v1/driving/${coordsStr}?sources=0&annotations=distance,duration`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM Table error');
    const data = await res.json();

    if (data.code === 'Ok' && data.distances && data.distances[0]) {
      const distances = data.distances[0]; // Mảng khoảng cách từ source 0 tới các đích
      const durations = data.durations ? data.durations[0] : [];

      needFetch.forEach((m, idx) => {
        const dMeters = distances[idx + 1];
        const dSeconds = durations[idx + 1];
        if (dMeters !== undefined && dMeters !== null) {
          const distKm = Math.round((dMeters / 1000) * 10) / 10;
          const durMin = dSeconds ? Math.max(1, Math.round(dSeconds / 60)) : Math.max(1, Math.round(distKm * 1.8));
          const rObj = {
            distanceKm: distKm,
            durationMin: durMin,
            isRealRoad: true,
          };
          results[m._id] = rObj;
          const cKey = `${userLoc.lat.toFixed(4)},${userLoc.lng.toFixed(4)}_${m.lat.toFixed(4)},${m.lng.toFixed(4)}`;
          routeCache.set(cKey, rObj);
        }
      });
      return results;
    }
  } catch (e) {
    console.warn('Lỗi OSRM Table matrix, tính toán fallback:', e);
  }

  // Fallback Haversine * 1.35
  needFetch.forEach((m) => {
    if (m.lat && m.lng) {
      const airKm = calculateHaversineKm(userLoc.lat, userLoc.lng, m.lat, m.lng);
      if (airKm !== null) {
        const estRoadKm = Math.round(airKm * 1.35 * 10) / 10;
        const durMin = Math.max(2, Math.round(estRoadKm * 1.8));
        const rObj = {
          distanceKm: estRoadKm,
          durationMin: durMin,
          isRealRoad: false,
        };
        results[m._id] = rObj;
      }
    }
  });

  return results;
}
