import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { SelectChangeEvent } from '@mui/material/Select';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import "leaflet-geosearch/dist/geosearch.css";

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

interface Racer {
  _id: string;
  username: string;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Race {
  _id: string;
  name: string;
  startTime: string;
  endTime: string | null;
  description: string;
  startingPoint?: Coordinate;
  endingPoint?: Coordinate;
  racers: Racer[];
}

interface RaceFormProps {
  race: Race | null;
  onClose: () => void;
}

const BASE_URL = "https://dataapi-qy43.onrender.com";

const MapClickHandler: React.FC<{
  onCoordinateSelect: (latlng: L.LatLng) => void;
}> = ({ onCoordinateSelect }) => {
  useMapEvents({
    click(e) {
      onCoordinateSelect(e.latlng);
    },
  });
  return null;
};

const SearchControl: React.FC<{ onSearchResult: (latlng: L.LatLng) => void }> = ({ onSearchResult }) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: true,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: false,
    });

    map.addControl(searchControl);

    map.on('geosearch/showlocation', (result) => {
      const latlng = L.latLng(result.location.y, result.location.x);
      onSearchResult(latlng);
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, onSearchResult]);

  return null;
};

const RaceForm: React.FC<RaceFormProps> = ({ race, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    description: "",
    startingPoint: undefined as Coordinate | undefined,
    endingPoint: undefined as Coordinate | undefined,
    racers: [] as string[],
  });
  const [availableRacers, setAvailableRacers] = useState<Racer[]>([]);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  useEffect(() => {
    const fetchRacers = async () => {
      try {
        const response = await axios.post(
          `${BASE_URL}/auth/all`,
          {},
          getAuthHeaders()
        );
        setAvailableRacers(response.data.map((user: any) => ({
          _id: user._id,
          username: user.username
        })));
      } catch (error) {
        console.error("Error fetching racers:", error);
      }
    };
    fetchRacers();

    if (race) {
      setFormData({
        name: race.name,
        startTime: race.startTime ? new Date(race.startTime).toISOString().slice(0, 16) : "",
        endTime: race.endTime ? new Date(race.endTime).toISOString().slice(0, 16) : "",
        description: race.description || "",
        startingPoint: race.startingPoint,
        endingPoint: race.endingPoint,
        racers: race.racers.map((racer) => racer._id),
      });
    }
  }, [race]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRacersChange = (e: SelectChangeEvent<string[]>) => {
    const value = e.target.value as string[];
    setFormData({ ...formData, racers: value });
  };

  const handleStartPointSelect = (latlng: L.LatLng) => {
    setFormData({
      ...formData,
      startingPoint: { latitude: latlng.lat, longitude: latlng.lng }
    });
  };

  const handleEndPointSelect = (latlng: L.LatLng) => {
    setFormData({
      ...formData,
      endingPoint: { latitude: latlng.lat, longitude: latlng.lng }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
        startingPoint: formData.startingPoint,
        endingPoint: formData.endingPoint,
      };

      if (race) {
        await axios.post(
          `${BASE_URL}/raceManagement/update`,
          { id: race._id, ...payload },
          getAuthHeaders()
        );

        const currentRacers = race.racers.map(r => r._id);
        const racersToAdd = payload.racers.filter(r => !currentRacers.includes(r));
        const racersToRemove = currentRacers.filter(r => !payload.racers.includes(r));

        for (const racerId of racersToAdd) {
          await axios.post(
            `${BASE_URL}/raceManagement/add-racer`,
            { id: race._id, racerId },
            getAuthHeaders()
          );
        }

        for (const racerId of racersToRemove) {
          await axios.post(
            `${BASE_URL}/raceManagement/remove-racer`,
            { id: race._id, racerId },
            getAuthHeaders()
          );
        }
      } else {
        await axios.post(
          `${BASE_URL}/raceManagement/create`,
          payload,
          getAuthHeaders()
        );
      }
      onClose();
    } catch (error) {
      console.error("Error saving race:", error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
      <Typography variant="h6">{race ? "Edit Race" : "Add Race"}</Typography>
      <TextField
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Start Time"
        name="startTime"
        type="datetime-local"
        value={formData.startTime}
        onChange={handleChange}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        required
      />
      <TextField
        label="End Time"
        name="endTime"
        type="datetime-local"
        value={formData.endTime}
        onChange={handleChange}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        fullWidth
        margin="normal"
        multiline
        rows={3}
      />
      
      {/* Starting Point Map */}
      <Typography variant="subtitle1" sx={{ mt: 2 }}>Select Starting Point</Typography>
      <Box sx={{ height: "300px", mb: 2 }}>
        <MapContainer
          center={[51.505, -0.09]} // Default center (London)
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler onCoordinateSelect={handleStartPointSelect} />
          <SearchControl onSearchResult={handleStartPointSelect} />
          {formData.startingPoint && (
            <Marker position={[formData.startingPoint.latitude, formData.startingPoint.longitude]} />
          )}
        </MapContainer>
      </Box>
      {formData.startingPoint && (
        <Typography>
          Starting Point: {formData.startingPoint.latitude.toFixed(4)}, {formData.startingPoint.longitude.toFixed(4)}
        </Typography>
      )}

      {/* Ending Point Map */}
      <Typography variant="subtitle1" sx={{ mt: 2 }}>Select Ending Point</Typography>
      <Box sx={{ height: "300px", mb: 2 }}>
        <MapContainer
          center={[51.505, -0.09]} // Default center (London)
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler onCoordinateSelect={handleEndPointSelect} />
          <SearchControl onSearchResult={handleEndPointSelect} />
          {formData.endingPoint && (
            <Marker position={[formData.endingPoint.latitude, formData.endingPoint.longitude]} />
          )}
        </MapContainer>
      </Box>
      {formData.endingPoint && (
        <Typography>
          Ending Point: {formData.endingPoint.latitude.toFixed(4)}, {formData.endingPoint.longitude.toFixed(4)}
        </Typography>
      )}

      <FormControl fullWidth margin="normal">
        <InputLabel>Racers</InputLabel>
        <Select multiple name="racers" value={formData.racers} onChange={handleRacersChange} label="Racers">
          {availableRacers.map((racer) => (
            <MenuItem key={racer._id} value={racer._id}>
              {racer.username}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box mt={2}>
        <Button type="submit" variant="contained" color="primary">
          {race ? "Update" : "Create"}
        </Button>
        <Button onClick={onClose} variant="outlined" color="secondary" sx={{ ml: 2 }}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default RaceForm;