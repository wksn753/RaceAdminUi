import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

export type LeaderBoardData ={
    racerId:string;
    username:string;
    startTime:string;
    endTime:string;
    duration:number;
}

export const LeaderboardColumns = (): ColumnDef<LeaderBoardData>[] => [
    {
      accessorKey: "username",
      /* header: "race Name", */
      header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Racer Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
    },
    {
      accessorKey: "startTime",
      header: "Start",
      cell: ({ row }) => {
          const dateString = row.getValue("startTime") as string;
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
        },
    },
    {
      accessorKey: "endTime",
      header: "End",
      cell: ({ row }) => {
        const dateString = row.getValue("endTime") as string;
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
      },
    },
    {
        accessorKey: "duration",
        header: "Duration",
      },
    
  
  ];