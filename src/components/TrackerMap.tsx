import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";

// Fix Leaflet marker icons
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface Racer {
  _id: string;
  username: string;
}

interface TrackerData {
  documentId: string;
  racerId: string;
  latitude: number | null;
  longitude: number | null;
  accel: { x: number; y: number; z: number };
  date: string;
  CarID: string;
}

interface TrackerMapProps {
  trackerData: TrackerData[];
  racers: Racer[];
}

// Function to generate a unique color for each racer
const generateColor = (index: number): string => {
  const colors = [
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#FFA500", // Orange
    "#800080", // Purple
    "#008000", // Dark Green
    "#FFC0CB", // Pink
    "#FFD700", // Gold
  ];
  return colors[index % colors.length];
};

// Function to create a custom marker icon with a specific color (transparent background, colored border)
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="transparent" stroke="${color}" stroke-width="4">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
          <polygon points="52 12 12 28 28 36 36 52 52 12"></polygon>
        </g>
      </svg>
    `,
    className: "custom-marker-icon", // Add a custom class name
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};
// Component to smoothly update the map's center
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1 });
  }, [center, map]);
  return null;
};

// Legend component to show racer colors
const Legend: React.FC<{ racersWithPositions: { racer: Racer; color: string }[] }> = ({ racersWithPositions }) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "30px",
        left: "10px",
        background: "white",
        padding: "10px",
        borderRadius: "5px",
        zIndex: 1000,
      }}
    >
      <h4>Racers</h4>
      {racersWithPositions.map(({ racer, color }) => (
        <div key={racer._id} style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
          <div
            style={{
              width: "20px",
              height: "10px",
              backgroundColor: color,
              marginRight: "5px",
            }}
          />
          <span>{racer.username}</span>
        </div>
      ))}
    </div>
  );
};

const TrackerMap: React.FC<TrackerMapProps> = ({ trackerData, racers }) => {
  // Group tracker data by racer and sort by date to get the latest position and path
  const racerPositions = racers.map((racer, index) => {
    const racerData = trackerData
      .filter(
        (data) =>
          (data.racerId === racer._id || data.CarID === racer.username) &&
          data.latitude !== null &&
          data.longitude !== null
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const positions: LatLngExpression[] = racerData.map((data) => [
      data.latitude!,
      data.longitude!,
    ]);

    return {
      racer,
      latestPosition: racerData[0], // Most recent position
      positions, // All positions for the path
      color: generateColor(index), // Unique color for this racer
    };
  });

  // Filter out racers with no valid positions
  const racersWithPositions = racerPositions.filter((racer) => racer.latestPosition);

  // Default center for the map
  const defaultCenter: [number, number] = [0.392930057, 32.6284372];

  // Center the map on the latest position of the first racer, if available
  const mapCenter: [number, number] =
    racersWithPositions.length > 0 &&
    racersWithPositions[0]?.latestPosition?.latitude != null &&
    racersWithPositions[0]?.latestPosition?.longitude != null
      ? [
          racersWithPositions[0].latestPosition.latitude,
          racersWithPositions[0].latestPosition.longitude,
        ]
      : defaultCenter;

  return (
    <MapContainer
      center={mapCenter}
      zoom={16}
      style={{ height: "400px", width: "100%" }}
      className="rounded-lg" // Add Tailwind class for rounded corners
    >
      <MapUpdater center={mapCenter} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {racersWithPositions.map(({ racer, latestPosition, positions, color }) => (
        <React.Fragment key={racer._id}>
          {/* Marker for the latest position */}
          <Marker
            position={[latestPosition.latitude!, latestPosition.longitude!]}
            icon={createCustomIcon(color)}
          >
            <Popup>
              <strong>{racer.username}</strong>
              <br />
              Acceleration: x: {latestPosition.accel.x.toFixed(2)}, y: {latestPosition.accel.y.toFixed(2)}, z: {latestPosition.accel.z.toFixed(2)}
              <br />
              Last Updated: {new Date(latestPosition.date).toLocaleString()}
            </Popup>
          </Marker>
          {/* Polyline for the racer's path */}
          {positions.length > 1 && (
            <Polyline
              positions={positions}
              pathOptions={{ color, weight: 1, opacity: 0.9 }}
            />
          )}
        </React.Fragment>
      ))}
      <Legend racersWithPositions={racersWithPositions.map(({ racer, color }) => ({ racer, color }))} />
    </MapContainer>
  );
};

export default TrackerMap;