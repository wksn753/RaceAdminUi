import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { Race, Racer } from "../types";

interface RaceFormProps {
  race: Race | null;
  onClose: () => void;
}

const RaceForm: React.FC<RaceFormProps> = ({ race, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    description: "",
    racers: [] as string[],
  });
  const [availableRacers, setAvailableRacers] = useState<Racer[]>([]);

  useEffect(() => {
    const fetchRacers = async () => {
      try {
        const response = await axios.get<Racer[]>("http://localhost:3000/api/tracker/racers");
        setAvailableRacers(response.data);
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
    setFormData({ ...formData, racers: e.target.value as string[] });
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
        await axios.put(`http://localhost:3000/api/tracker/races/${race._id}`, payload);
      } else {
        await axios.post("http://localhost:3000/api/tracker/races", payload);
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
        <Select
          multiple
          name="racers"
          value={formData.racers}
          onChange={handleRacersChange}
          label="Racers"
        >
          {availableRacers.map((racer) => (
            <MenuItem key={racer._id} value={racer._id}>
              {racer.name}
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