import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";

interface Racer {
  _id: string;
  name: string;
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
        const response = await axios.get("http://localhost:3000/api/tracker/races");
        setRaces(response.data);
      } catch (error) {
        console.error("Error fetching races:", error);
      }
    };
    fetchRaces();
  }, [refresh]);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/tracker/races/${id}`);
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
              <TableCell>{race.racers.map((racer) => racer.name).join(", ")}</TableCell>
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