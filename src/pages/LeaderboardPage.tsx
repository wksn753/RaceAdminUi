import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Typography, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
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

  const handleRaceChange = (event: SelectChangeEvent) => {
    setSelectedRace(event.target.value);
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
      <FormControl fullWidth sx={{ mb: 4, maxWidth: 300 }}>
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