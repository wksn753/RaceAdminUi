import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import {RaceDataTable} from "../components/RaceManagement/RacesDataTable";
import {  RacesColumns} from "../types/Races";

const BASE_URL = "https://dataapi-qy43.onrender.com";

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

interface RaceListProps {
  onEdit: (race: Race) => void;
  refresh: boolean;
}

const RaceList: React.FC<RaceListProps> = ({ onEdit, refresh }) => {
  const [races, setRaces] = useState<Race[]>([]);
  
  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.post(
          `${BASE_URL}/raceManagement/all`,
          {},
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
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${BASE_URL}/raceManagement/delete`,
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setRaces(races.filter((race) => race._id !== id));
    } catch (error) {
      console.error("Error deleting race:", error);
    }
  };

  // Helper function to format coordinates
  const formatCoordinates = (point?: Coordinate) => {
    if (!point) return "Not set";
    return `${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}`;
  };

  const RacesColumnsData = RacesColumns(onEdit, handleDelete);

  return (

    <RaceDataTable columns={RacesColumnsData} data={races}  />
   
  );
};

export default RaceList;