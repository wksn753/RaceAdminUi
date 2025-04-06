import React, { useState, useEffect } from "react";
import axios from "axios";
import { Typography, Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import TrackerTable from "../components/TrackerTable";
import TrackerMap from "../components/TrackerMap";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, query, where, getDocs, onSnapshot, DocumentData } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBc-FaimZqp-g0S_nRh2OuXxfWCxnGhYhQ",
  authDomain: "monitorapp-35a6d.firebaseapp.com",
  projectId: "monitorapp-35a6d",
  storageBucket: "monitorapp-35a6d.firebasestorage.app",
  messagingSenderId: "806754364883",
  appId: "1:806754364883:web:0dc8773ae37d1299285326",
  measurementId: "G-E0D1WJD1RL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const carTrackRef = collection(db, "CarTrack");

interface Race {
  _id: string;
  name: string;
  racers: Racer[];
}

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
  RaceID: string;
  CarID: string;
}

const LiveTrackingPage: React.FC = () => {
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<string>("");
  const [trackerData, setTrackerData] = useState<TrackerData[]>([]);
  const [racers, setRacers] = useState<Racer[]>([]);

  // Fetch races from MongoDB
  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.post("https://dataapi-qy43.onrender.com/raceManagement/all",
          {}, // Empty request body
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }

        );
        setRaces(response.data);
      } catch (error) {
        console.error("Error fetching races:", error);
      }
    };
    fetchRaces();
  }, []);

  // Set up Firebase listener when a race is selected
  useEffect(() => {
    if (!selectedRace) return;

    // Find the selected race to get its name (RaceID in Firebase)
    const race = races.find((r) => r._id === selectedRace);
    if (!race) return;

    setRacers(race.racers);
    setTrackerData([]); // Reset tracker data

    // Fetch initial data from Firebase
    const fetchInitialData = async () => {
      const q = query(carTrackRef, where("RaceID", "==", race.name));
      const querySnapshot = await getDocs(q);
      
      const initialData: TrackerData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        initialData.push({
          documentId: doc.id,
          ...data,
          latitude: parseLocation(data.Location)?.latitude || null,
          longitude: parseLocation(data.Location)?.longitude || null,
          accel: { x: parseFloat(data.Acceleration) || 0, y: 0, z: 0 },
          date: parseTime(data.Time).toISOString(),
          racerId: race.racers.find((racer) => racer.name === data.CarID)?._id || "",
          RaceID: data.RaceID,
          CarID: data.CarID,
        });
      });
      
      setTrackerData(initialData);
    };
    
    fetchInitialData();

    // Set up real-time listener
    const q = query(carTrackRef, where("RaceID", "==", race.name));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        const documentId = change.doc.id;

        if (change.type === "added") {
          setTrackerData((prev) => {
            if (prev.some((item) => item.documentId === documentId)) return prev; // Avoid duplicates
            return [
              ...prev,
              {
                documentId,
                ...data,
                latitude: parseLocation(data.Location)?.latitude || null,
                longitude: parseLocation(data.Location)?.longitude || null,
                accel: { x: parseFloat(data.Acceleration) || 0, y: 0, z: 0 },
                date: parseTime(data.Time).toISOString(),
                racerId: race.racers.find((racer) => racer.name === data.CarID)?._id || "",
                RaceID: data.RaceID,
                CarID: data.CarID,
              },
            ];
          });
        }
        
        if (change.type === "modified") {
          setTrackerData((prev) =>
            prev.map((item) =>
              item.documentId === documentId
                ? {
                    ...item,
                    ...data,
                    latitude: parseLocation(data.Location)?.latitude || null,
                    longitude: parseLocation(data.Location)?.longitude || null,
                    accel: { x: parseFloat(data.Acceleration) || 0, y: 0, z: 0 },
                    date: parseTime(data.Time).toISOString(),
                    racerId: race.racers.find((racer) => racer.name === data.CarID)?._id || "",
                    RaceID: data.RaceID,
                    CarID: data.CarID,
                  }
                : item
            )
          );
        }
      });
    });

    return () => {
      unsubscribe(); // Clean up listener on unmount or race change
    };
  }, [selectedRace, races]);

  // Parse Location string
  const parseLocation = (location: string) => {
    const match = location?.match(/\[([\d.]+)' ([NS]), ([\d.]+)' ([EW])\]/);
    if (!match) return { latitude: null, longitude: null };

    let latitude = parseFloat(match[1]);
    if (match[2] === "S") latitude = -latitude;

    let longitude = parseFloat(match[3]);
    if (match[4] === "W") longitude = -longitude;

    return { latitude, longitude };
  };

  // Parse Time string
  const parseTime = (timeStr: string) => {
    const cleanedTimeStr = timeStr?.replace("UTC+3", "+0300") || new Date().toISOString();
    return new Date(cleanedTimeStr);
  };

  const handleRaceChange = (e: SelectChangeEvent) => {
    setSelectedRace(e.target.value);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Live Race Tracking
      </Typography>
      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel>Select Race</InputLabel>
        <Select
          value={selectedRace}
          onChange={handleRaceChange}
          label="Select Race"
        >
          <MenuItem value="">Select a race</MenuItem>
          {races.map((race) => (
            <MenuItem key={race._id} value={race._id}>
              {race.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {selectedRace && (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Tracker Data
            </Typography>
            <TrackerTable trackerData={trackerData} racers={racers} />
          </Box>
          <Box>
            <Typography variant="h5" gutterBottom>
              Live Map
            </Typography>
            <TrackerMap trackerData={trackerData} racers={racers} />
          </Box>
        </>
      )}
    </div>
  );
};

export default LiveTrackingPage;