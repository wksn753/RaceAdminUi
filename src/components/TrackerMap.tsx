import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});


interface Racer {
  _id: string;
  name: string;
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
const defaultCoordinates: [number, number] = [1.3733, 32.2903]; // Near Uganda's center

const TrackerMap: React.FC<TrackerMapProps> = ({ trackerData, racers }) => {
  const latestPositions = racers
    .map((racer) => {
      const racerData = trackerData
        .filter(
          (data) =>
            (data.racerId === racer._id || data.CarID === racer.name) &&
            data.latitude !== null &&
            data.longitude !== null
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return { racer, position: racerData[0] };
    })
    .filter((item) => item.position);

  const defaultCenter: [number, number] = [0.392930057, 32.6284372];

  return (
    <MapContainer
    center={
      latestPositions.length > 0 && 
      latestPositions[0]?.position?.latitude != null && 
      latestPositions[0]?.position?.longitude != null
        ? [latestPositions[0].position.latitude, latestPositions[0].position.longitude] as [number, number]
        : defaultCenter
    }
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {latestPositions.map(({ racer, position }) => (
        <Marker
        key={racer._id}
        position={[
          position.latitude ?? defaultCoordinates[0],
          position.longitude ?? defaultCoordinates[1]
        ]}
      >
        <Popup>{racer.name}</Popup>
      </Marker>
      
      ))}
    </MapContainer>
  );
};

export default TrackerMap;