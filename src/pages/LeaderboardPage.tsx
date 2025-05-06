import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Typography, 
  Box, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  SelectChangeEvent, 
  Alert, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper 
} from "@mui/material";

interface Race {
  _id: string;
  name: string;
}

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


interface LeaderboardEntry {
  racerId: string;
  username: string;
  startTime: string;
  endTime: string;
  duration: number;
}

const BASE_URL = "https://dataapi-qy43.onrender.com";

const LeaderboardPage: React.FC = () => {
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  // Fetch races
  useEffect(() => {
    const fetchRaces = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(
          `${BASE_URL}/raceManagement/all`,
          {},
          getAuthHeaders()
        );
        setRaces(response.data);
      } catch (error: any) {
        setError(error.message || "Failed to load races. Please try again.");
        console.error("Error fetching races:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRaces();
  }, []);

  // Fetch leaderboard when race is selected
  //update api to add this route
  useEffect(() => {
    if (!selectedRace) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(
          `${BASE_URL}/raceManagement/leaderboard`,
          { id: selectedRace },
          getAuthHeaders()
        );
        setLeaderboard(response.data.leaderboard);
      } catch (error: any) {
        setError(error.message || "Failed to load leaderboard. Please try again.");
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [selectedRace]);
  
  const handleRaceChange = (value: string) => {
    setSelectedRace(value);
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Race Leaderboard
      </Typography>
      {loading && <Typography>Loading...</Typography>}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <div className="mb-6 w-full">
      <label htmlFor="race-select" className="mb-2 block text-sm font-medium text-foreground">
        Select Race
      </label>
      <Select
        value={selectedRace}
        onValueChange={handleRaceChange}
      >
        <SelectTrigger
          id="race-select"
          className="w-full bg-background text-foreground border-border focus:ring-2 focus:ring-ring"
        >
          <SelectValue placeholder="Select a race" />
        </SelectTrigger>
        <SelectContent className="bg-background text-foreground border-border">
          <SelectItem value="Races" disabled>
            Select a race
          </SelectItem>
          {races.map((race) => (
            <SelectItem key={race._id} value={race._id}>
              {race.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

      {selectedRace && leaderboard.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Racer</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Duration</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboard.map((entry, index) => (
                <TableRow key={entry.racerId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{entry.username}</TableCell>
                  <TableCell>{new Date(entry.startTime).toLocaleString()}</TableCell>
                  <TableCell>{new Date(entry.endTime).toLocaleString()}</TableCell>
                  <TableCell>{formatDuration(entry.duration)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {selectedRace && leaderboard.length === 0 && !loading && (
        <Typography>No completed races yet.</Typography>
      )}
    </Box>
  );
};

export default LeaderboardPage;