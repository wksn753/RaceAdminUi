import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from "@mui/material";

interface Racer {
  _id: string;
  username: string;
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Default rows per page

  // Handle page change
  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };

  // Calculate the data to display for the current page
  const paginatedData = trackerData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
          {paginatedData.map((data) => {
            const racer = racers.find((r) => r._id === data.racerId || r.username === data.CarID);
            return (
              <TableRow key={data.documentId}>
                <TableCell>{racer ? racer.username : "Unknown"}</TableCell>
                <TableCell>{data.latitude ?? "N/A"}</TableCell>
                <TableCell>{data.longitude ?? "N/A"}</TableCell>
                <TableCell>{data.accel?.x ?? "N/A"}</TableCell>
                <TableCell>{new Date(data.date).toLocaleString()}</TableCell>
              </TableRow>
            );
          })}
          {paginatedData.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={trackerData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
};

export default TrackerTable;