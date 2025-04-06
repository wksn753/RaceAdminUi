import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";

const BASE_URL = "https://dataapi-qy43.onrender.com";

interface Racer {
  _id: string;
  username: string; // Changed to match your backend which populates 'username'
}

interface Race {
  _id: string;
  name: string;
  startTime: string;
  endTime: string | null;
  description: string;
  racers: Racer[];
}

interface RaceListProps {
  onEdit: (race: Race) => void;
  refresh: boolean;
}

const RaceList: React.FC<RaceListProps> = ({ onEdit, refresh }) => {
  const [races, setRaces] = useState<Race[]>([]);
  
  useEffect(() => {
    const fetchRaces = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // Make request to the all races endpoint
        const response = await axios.post(
          `${BASE_URL}/raceManagement/all`,
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
  }, [refresh]);

  const handleDelete = async (id: string) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Make request to the delete endpoint
      await axios.post(
        `${BASE_URL}/raceManagement/delete`,
        { id }, // ID in request body
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the UI by removing the deleted race
      setRaces(races.filter((race) => race._id !== id));
    } catch (error) {
      console.error("Error deleting race:", error);
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Start Time</TableCell>
            <TableCell>End Time</TableCell>
            <TableCell>Racers</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {races.map((race) => (
            <TableRow key={race._id}>
              <TableCell>{race.name}</TableCell>
              <TableCell>{new Date(race.startTime).toLocaleString()}</TableCell>
              <TableCell>{race.endTime ? new Date(race.endTime).toLocaleString() : "Ongoing"}</TableCell>
              <TableCell>
                {race.racers.map((racer) => racer.username).join(", ")}
              </TableCell>
              <TableCell>
                <Button onClick={() => onEdit(race)} color="primary">
                  Edit
                </Button>
                <Button onClick={() => handleDelete(race._id)} color="secondary">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RaceList;