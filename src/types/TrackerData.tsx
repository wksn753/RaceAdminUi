import { ColumnDef } from "@tanstack/react-table";

export type CarTrackDocument = {
  RaceID: string;
  CarID: string;
  Location: string;
  Acceleration: string;
  Time: string;
};

export type Racer = {
  _id: string;
  username: string;
};

export type Race = {
  _id: string;
  name: string;
  racers: { userId: { _id: string; username: string } }[];
  startingPoint: { latitude: number; longitude: number };
  endingPoint: { latitude: number; longitude: number };
};

export type TrackerData = {
  documentId: string;
  racerId: string;
  latitude: number | null;
  longitude: number | null;
  accel: { x: number; y: number; z: number };
  date: string;
  RaceID: string;
  CarID: string;
};

// Updated TrackerColumns to accept trackerData and racers as parameters
export const TrackerColumns = (
  
  racers: Racer[]
): ColumnDef<TrackerData>[] => [
  {
    accessorKey: "racerName",
    header: "Racer Name",
    cell: ({ row }) => {
      const racerId = row.original.racerId;
      const racer = racers.find((r) => r._id === racerId);
      return racer ? racer.username : "Unknown Racer";
    },
  },
  // Add other columns as needed
  {
    accessorKey: "latitude",
    header: "Latitude",
  },
  {
    accessorKey: "longitude",
    header: "Longitude",
  },
  {
    accessorKey: "accel",
    header: "Accleration",
    cell: ({ row }) => {
      const accel = row.original.accel;
      return `${accel.x}`;
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell:({row})=>{
        const dateString = row.getValue("date") as string;
        const date = new Date(dateString);
        
        // Format: DD/MM/YYYY, HH:MM:SS
        const formatted = new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(date);
        
        return <div>{formatted}</div>;
    }
  },
  // Add more columns for accel, RaceID, CarID, etc., as required
];

export default TrackerColumns;