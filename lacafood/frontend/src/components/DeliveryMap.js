import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon issue in webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Store location (LacaFood HQ - Quận 1, TP.HCM)
export const STORE_LOCATION = {
  lat: 10.7769,
  lng: 106.7009,
  name: 'LacaFood - Quận 1, TP.HCM'
};

// Custom icons
const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to fit map bounds to markers
function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length === 2) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds]);
  return null;
}

const DeliveryMap = ({ customerLat, customerLng, customerAddress, height = '300px' }) => {
  const [route, setRoute] = useState(null);
  const [routeDistance, setRouteDistance] = useState(null);
  const fetchedRef = useRef(null);

  useEffect(() => {
    if (!customerLat || !customerLng) return;

    const key = `${customerLat},${customerLng}`;
    if (fetchedRef.current === key) return;
    fetchedRef.current = key;

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${STORE_LOCATION.lng},${STORE_LOCATION.lat};${customerLng},${customerLat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          setRoute(coords);
          setRouteDistance((data.routes[0].distance / 1000).toFixed(1));
        }
      } catch (err) {
        console.error('Error fetching route:', err);
      }
    };
    fetchRoute();
  }, [customerLat, customerLng]);

  if (!customerLat || !customerLng) return null;

  const bounds = [
    [STORE_LOCATION.lat, STORE_LOCATION.lng],
    [customerLat, customerLng]
  ];

  return (
    <div className="delivery-map-container" style={{ height }}>
      <MapContainer
        center={[STORE_LOCATION.lat, STORE_LOCATION.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds bounds={bounds} />

        {/* Store marker */}
        <Marker position={[STORE_LOCATION.lat, STORE_LOCATION.lng]} icon={storeIcon}>
          <Popup>
            <strong>🏪 {STORE_LOCATION.name}</strong>
          </Popup>
        </Marker>

        {/* Customer marker */}
        <Marker position={[customerLat, customerLng]} icon={customerIcon}>
          <Popup>
            <strong>📍 {customerAddress || 'Địa chỉ giao hàng'}</strong>
          </Popup>
        </Marker>

        {/* Route line */}
        {route && (
          <Polyline
            positions={route}
            pathOptions={{ color: '#ff5722', weight: 4, opacity: 0.8 }}
          />
        )}
      </MapContainer>

      <div className="map-info-bar">
        <span>🏪 LacaFood</span>
        <span className="map-route-line">
          {route ? '━━━━━━━━━' : '· · · · · · · · ·'}
        </span>
        {routeDistance && <span className="map-distance">📏 {routeDistance}km</span>}
        <span>📍 Khách hàng</span>
      </div>
    </div>
  );
};

export default DeliveryMap;
