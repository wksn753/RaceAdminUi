import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  initializeApp,
} from "firebase/app";
import { getFirestore, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { parse, isValid } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import TrackerMap from "../components/TrackerMap";
import {TrackerDataTable} from "../components/TrackerManagement/TrackerDataTable";
import { TrackerColumns } from "../types/TrackerData";

const firebaseConfig = {
  apiKey: "AIzaSyD2EC1qzcLkMhyNLaX0UhZUeenX8saZo1w",
  authDomain: "rutina-orion.firebaseapp.com",
  projectId: "rutina-orion",
  storageBucket: "rutina-orion.firebasestorage.app",
  messagingSenderId: "873985298780",
  appId: "1:873985298780:web:2c2634659c6a0d4805f199",
  measurementId: "G-SL7FG7FHXM",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const carTrackRef = collection(db, "CarTrack");

const BASE_URL = "https://dataapi-qy43.onrender.com/raceManagement";

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
  racers: { userId: { _id: string; username: string } }[];
  startingPoint: { latitude: number; longitude: number };
  endingPoint: { latitude: number; longitude: number };
}

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

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  useEffect(() => {
    const fetchRaces = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${BASE_URL}/all`, {}, getAuthHeaders());
        // Filter out races with empty _id to prevent SelectItem issues
        const validRaces = response.data.filter((race: Race) => race._id && race._id.trim() !== "");
        setRaces(validRaces);
      } catch (error: any) {
        setError(error.message || "Failed to load races. Please try again.");
        console.error("Error fetching races:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRaces();
  }, []);

  useEffect(() => {
    if (!selectedRace) return;

    const race = races.find((r) => r._id === selectedRace);
    if (!race) return;

    setRacers(race.racers.map((r) => ({ _id: r.userId._id, username: r.userId.username })));
    setTrackerData([]);
    setError(null);

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
            return;
          }
          const racer = race.racers.find((racer) => racer.userId.username === data.CarID);
          if (racer) {
            checkStartEndPoints(race, racer.userId._id, latitude, longitude, parseTime(data.Time).toISOString());
          }
          initialData.push({
            documentId: doc.id,
            racerId: racer?.userId._id || "",
            latitude,
            longitude,
            accel: { x: parseFloat(data.Acceleration) || 0, y: 0, z: 0 },
            date: parseTime(data.Time).toISOString(),
            RaceID: data.RaceID,
            CarID: data.CarID,
          });
        });
        setTrackerData(initialData);
      } catch (error) {
        setError("Failed to fetch initial data from Firebase.");
        console.error("Firebase error:", error);
      }
    };

    fetchInitialData();

    const q = query(carTrackRef, where("RaceID", "==", race.name));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const data = change.doc.data() as CarTrackDocument;
          const documentId = change.doc.id;
          const { latitude, longitude } = parseLocation(data.Location);
          if (latitude === null || longitude === null) {
            console.warn(`Invalid location for document ${documentId}: ${data.Location}`);
            return;
          }

          const racer = race.racers.find((racer) => racer.userId.username === data.CarID);
          if (racer) {
            checkStartEndPoints(race, racer.userId._id, latitude, longitude, parseTime(data.Time).toISOString());
          }

          if (change.type === "added") {
            setTrackerData((prev) => {
              if (prev.some((item) => item.documentId === documentId)) return prev;
              return [
                ...prev,
                {
                  documentId,
                  racerId: racer?.userId._id || "",
                  latitude,
                  longitude,
                  accel: { x: parseFloat(data.Acceleration) || 0, y: 0, z: 0 },
                  date: parseTime(data.Time).toISOString(),
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
                      racerId: racer?.userId._id || "",
                      latitude,
                      longitude,
                      accel: { x: parseFloat(data.Acceleration) || 0, y: 0, z: 0 },
                      date: parseTime(data.Time).toISOString(),
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

    const cleanedTimeStr = rawTime.replace(/UTC([+-]\d+)/, (_, offset) => {
      return offset.includes(":") ? offset : `${offset}:00`;
    });

    const parsedDate = parse(cleanedTimeStr, "yyyy-MM-dd HH:mm:ssXXX", new Date());
    if (isValid(parsedDate)) return parsedDate;

    const customParsed = parse(cleanedTimeStr, "dd/MM/yyyy HH:mm:ssXXX", new Date());
    if (isValid(customParsed)) return customParsed;

    console.warn(`parseTime: Failed to parse "${rawTime}" (cleaned: "${cleanedTimeStr}"), using current date`);
    return new Date();
  };

  const checkStartEndPoints = async (race: Race, racerId: string, latitude: number, longitude: number, actionDate: string) => {
    const threshold = 0.01;
    console.log(latitude + " " + longitude + " " + race.startingPoint.latitude + " " + race.startingPoint.longitude + " " + race.endingPoint.latitude + " " + race.endingPoint.longitude + "");
    try {
      if (
        Math.abs(latitude - race.startingPoint.latitude) < threshold &&
        Math.abs(longitude - race.startingPoint.longitude) < threshold
      ) {
        await axios.post(
          `${BASE_URL}/start-racer`,
          { id: race._id, racerId, startTime: actionDate },
          getAuthHeaders()
        );
      }
      if (
        Math.abs(latitude - race.endingPoint.latitude) < threshold &&
        Math.abs(longitude - race.endingPoint.longitude) < threshold
      ) {
        await axios.post(
          `${BASE_URL}/end-racer`,
          { id: race._id, racerId, endTime: actionDate },
          getAuthHeaders()
        );
      }
    } catch (error) {
      console.error("Error recording start/end time:", error);
    }
  };

  const handleRaceChange = (value: string) => {
    setSelectedRace(value); // Update selectedRace with the new value
  };

  return (
    <div className="space-y-6 bg-background p-4">
      <h1 className="text-3xl font-bold text-foreground">Live Race Tracking</h1>

      {loading && <p className="text-muted-foreground">Loading races...</p>}

      {error && (
        <Alert variant="destructive" className="border-destructive bg-destructive/10 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6 w-full">
        <label htmlFor="race-select" className="mb-2 block text-sm font-medium text-foreground">
          Select Race
        </label>
        <Select value={selectedRace} onValueChange={handleRaceChange}>
          <SelectTrigger
            id="race-select"
            className="w-full bg-background text-foreground border-border focus:ring-2 focus:ring-ring"
          >
            <SelectValue placeholder="Select a race" />
          </SelectTrigger>
          <SelectContent className="bg-background text-foreground border-border">
            {races
              .filter((race) => race._id && race._id.trim() !== "")
              .map((race) => (
                <SelectItem key={race._id} value={race._id}>
                  {race.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {selectedRace && (
        <>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Live Map</h2>
            <TrackerMap trackerData={trackerData} racers={racers} />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Tracker Data</h2>
            <TrackerDataTable
             columns={TrackerColumns(racers)}
              data={trackerData}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default LiveTrackingPage;