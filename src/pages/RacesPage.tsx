import React, { useState } from "react";
import RaceList from "../components/RaceList";
import RaceForm from "../components/RaceForm";
import { Typography, Button, Box } from "@mui/material";

interface Race {
  _id: string;
  name: string;
  startTime: string;
  endTime: string | null;
  description: string;
  racers: Racer[];
}

interface Racer {
  _id: string;
  name: string;
}

const RacesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [refresh, setRefresh] = useState(false);

  const handleEdit = (race: Race) => {
    setSelectedRace(race);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedRace(null);
    setRefresh((prev) => !prev);
  };

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Races</Typography>
        <Button variant="contained" onClick={() => setShowForm(true)}>
          Add Race
        </Button>
      </Box>
      {showForm && <RaceForm race={selectedRace} onClose={handleFormClose} />}
      <RaceList onEdit={handleEdit} refresh={refresh} />
    </div>
  );
};

export default RacesPage;