import React, { useState } from "react";
import RaceList from "../components/RaceList";

import { Typography } from "@mui/material";
import { Button } from "@/components/ui/button"
import {RacesForm} from "../components/RaceManagement/RacesForm"

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
      {/* <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}> */}
        <Typography variant="h4">Races</Typography>
        <Button onClick={() => setShowForm(true)} variant={"default"} >
          Add Race
        </Button>
     {/*  </Box> */}
      {showForm && <RacesForm race={selectedRace} onClose={handleFormClose} />}
      <RaceList onEdit={handleEdit} refresh={refresh} />
    </div>
  );
};

export default RacesPage;