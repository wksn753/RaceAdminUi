import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

interface Racer {
  _id: string;
  name: string;
}

interface TrackerData {
  documentId: string;
  racerId: string;
  latitude: number | null;
  longitude: number | null;
  accel: { x: number; y: number; z: number };
  date: string;
  CarID: string;
}

interface TrackerTableProps {
  trackerData: TrackerData[];
  racers: Racer[];
}

const TrackerTable: React.FC<TrackerTableProps> = ({ trackerData, racers }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Racer</TableCell>
            <TableCell>Latitude</TableCell>
            <TableCell>Longitude</TableCell>
            <TableCell>Acceleration (x)</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trackerData.map((data) => {
            const racer = racers.find((r) => r._id === data.racerId || r.name === data.CarID);
            return (
              <TableRow key={data.documentId}>
                <TableCell>{racer ? racer.username : "Unknown"}</TableCell>
                <TableCell>{data.latitude || "N/A"}</TableCell>
                <TableCell>{data.longitude || "N/A"}</TableCell>
                <TableCell>{data.accel?.x || "N/A"}</TableCell>
                <TableCell>{new Date(data.date).toLocaleString()}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TrackerTable;