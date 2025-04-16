import React, { useState, useEffect } from "react";
import axios from "axios";
import { Typography, Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Alert } from "@mui/material";
import TrackerTable from "../components/TrackerTable";
import TrackerMap from "../components/TrackerMap";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { parse, isValid } from "date-fns";

// Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBc-FaimZqp-g0S_nRh2OuXxfWCxnGhYhQ",
//   authDomain: "monitorapp-35a6d.firebaseapp.com",
//   projectId: "monitorapp-35a6d",
//   storageBucket: "monitorapp-35a6d.firebasestorage.app",
//   messagingSenderId: "806754364883",
//   appId: "1:806754364883:web:0dc8773ae37d1299285326",
//   measurementId: "G-E0D1WJD1RL",
// };
const firebaseConfig={
  apiKey: "AIzaSyD2EC1qzcLkMhyNLaX0UhZUeenX8saZo1w",
  authDomain: "rutina-orion.firebaseapp.com",
  projectId: "rutina-orion",
  storageBucket: "rutina-orion.firebasestorage.app",
  messagingSenderId: "873985298780",
  appId: "1:873985298780:web:2c2634659c6a0d4805f199",
  measurementId: "G-SL7FG7FHXM"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const carTrackRef = collection(db, "CarTrack");

// Define a more specific type for Firestore CarTrack documents
interface CarTrackDocument {
  RaceID: string;
  CarID: string;
  Location: string;
  Acceleration: string;
  Time: string;
}

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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch races from MongoDB
  useEffect(() => {
    const fetchRaces = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const response = await axios.post(
          "https://dataapi-qy43.onrender.com/raceManagement/all",
          {}, // Empty request body
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRaces(response.data);
      } catch (error: any) {
        setError(error.message || "Failed to load races. Please try again.");
        console.error("Error fetching races:", error);
      } finally {
        console.log("Races fetched:", races);
        setLoading(false);
      }
    };
    fetchRaces();
  }, []);

  // Set up Firebase listener when a race is selected
  useEffect(() => {
    if (!selectedRace) return;

    const race = races.find((r) => r._id === selectedRace);
    if (!race) return;

    setRacers(race.racers);
    setTrackerData([]);
    setError(null);

    // Fetch initial data from Firebase
    const fetchInitialData = async () => {
      const initialData: TrackerData[] = [];

      try {
        const q = query(carTrackRef, where("RaceID", "==", race.name));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const data = doc.data() as CarTrackDocument;
          const { latitude, longitude } = parseLocation(data.Location);
          if (latitude === null || longitude === null) {
            console.warn(`Invalid location for document ${doc.id}: ${data.Location}`);
          }
          initialData.push({
            documentId: doc.id,
            ...data,
            latitude,
            longitude,
            accel: { x: parseFloat(data.Acceleration) || 0, y: 0, z: 0 },
            date: parseTime(data.Time).toISOString(),
            racerId: race.racers.find((racer) => racer.username === data.CarID)?._id || "",
            RaceID: data.RaceID,
            CarID: data.CarID,
          });
        });
        setTrackerData(initialData);
      } catch (error) {
        setError("Failed to fetch initial data from Firebase.");
        console.error("Firebase error:", error);
      }finally{
        console.log(race.racers);

        console.log(initialData);
      }
    };

    fetchInitialData();

    // Set up real-time listener
    const q = query(carTrackRef, where("RaceID", "==", race.name));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data() as CarTrackDocument;
          const documentId = change.doc.id;

          if (change.type === "added") {
            setTrackerData((prev) => {
              if (prev.some((item) => item.documentId === documentId)) return prev; // Avoid duplicates
              const { latitude, longitude } = parseLocation(data.Location);
              if (latitude === null || longitude === null) {
                console.warn(`Invalid location for document ${documentId}: ${data.Location}`);
              }
              return [
                ...prev,
                {
                  documentId,
                  ...data,
                  latitude,
                  longitude,
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
      },
      (error) => {
        setError("Failed to fetch live data from Firebase.");
        console.error("Firebase listener error:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [selectedRace, races]);

  const parseLocation = (location: string | undefined): { latitude: number | null; longitude: number | null } => {
    if (!location) return { latitude: null, longitude: null };

    // Adjust the regex pattern to match the new format
    const match = location.match(/^\[([\d.-]+)° ([NS]), ([\d.-]+)° ([EW])\]$/);
    if (!match) return { latitude: null, longitude: null };

    let latitude = parseFloat(match[1]);
    if (match[2] === "S") latitude = -latitude;

    let longitude = parseFloat(match[3]);
    if (match[4] === "W") longitude = -longitude;

    return { latitude, longitude };
  };

  const parseTime = (rawTime: unknown): Date => {
    if (typeof rawTime !== "string" || rawTime.trim() === "") {
      console.warn("parseTime: rawTime is not a valid string, using current date as fallback");
      return new Date();
    }

    // Clean up time string — adjust UTC offset if needed
    const cleanedTimeStr = rawTime.replace(/UTC([+-]\d+)/, (_, offset) => {
      return offset.includes(":") ? offset : `${offset}:00`;
    });

    // Try parsing standard format: "yyyy-MM-dd HH:mm:ssXXX"
    const parsedDate = parse(cleanedTimeStr, "yyyy-MM-dd HH:mm:ssXXX", new Date());
    if (isValid(parsedDate)) return parsedDate;

    // Try custom format: "dd/MM/yyyy HH:mm:ssXXX"
    const customParsed = parse(cleanedTimeStr, "dd/MM/yyyy HH:mm:ssXXX", new Date());
    if (isValid(customParsed)) return customParsed;

    console.warn(`parseTime: Failed to parse "${rawTime}" (cleaned: "${cleanedTimeStr}"), using current date`);
    return new Date();
  };

  const handleRaceChange = (event: SelectChangeEvent) => {
    setSelectedRace(event.target.value);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Live Race Tracking
      </Typography>
      {loading && <Typography>Loading races...</Typography>}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel>Select Race</InputLabel>
        <Select value={selectedRace} onChange={handleRaceChange} label="Select Race">
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