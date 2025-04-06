import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { SelectChangeEvent } from '@mui/material/Select';

interface Racer {
  _id: string;
  username: string; // Changed from 'name' to match User model
}

interface Race {
  _id: string;
  name: string;
  startTime: string;
  endTime: string | null;
  description: string;
  racers: Racer[];
}

interface RaceFormProps {
  race: Race | null;
  onClose: () => void;
}

const BASE_URL = "https://dataapi-qy43.onrender.com";

const RaceForm: React.FC<RaceFormProps> = ({ race, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    description: "",
    racers: [] as string[],
  });
  const [availableRacers, setAvailableRacers] = useState<Racer[]>([]);

  // Get token from localStorage or your auth system
  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth implementation
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
        // Assuming your User model returns username instead of name
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
      };

      if (race) {
        // Update existing race
        await axios.post(
          `${BASE_URL}/raceManagement/update`,
          { id: race._id, ...payload },
          getAuthHeaders()
        );
        
        // Update racers separately if changed
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
        // Create new race
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
      <FormControl fullWidth margin="normal">
        <InputLabel>Racers</InputLabel>
        <Select multiple name="racers" value={formData.racers} onChange={handleRacersChange} label="Racers">
          {availableRacers.map((racer) => (
            <MenuItem key={racer._id} value={racer._id}>
              {racer.username} {/* Changed from racer.name to racer.username */}
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