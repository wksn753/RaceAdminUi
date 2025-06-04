import { ColumnDef } from "@tanstack/react-table"
import {  Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Racer ={
    _id: string;
    username: string;
  }
  
  export type Coordinate= {
    latitude: number;
    longitude: number;
  }

// This type is used to define the shape of our data.
export type Races = {
    _id: string;
    name: string;
    startTime: string;
    endTime: string | null;
    description: string;
    startingPoint?: Coordinate;
    endingPoint?: Coordinate;
    racers: Racer[];
}

export const RacesColumns = (
  onEdit: (race: Races) => void,
  handleDelete: (id: string) => void
): ColumnDef<Races>[] => [
  {
    accessorKey: "name",
    /* header: "race Name", */
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Race Name
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
    accessorKey: "racers",
    header: "Racers",
    cell: ({ row }) => {
      const race = row.original;
      const racers = race.racers || [];

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {racers.length} Racer{racers.length !== 1 ? "s" : ""}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Racers</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {racers.length > 0 ? (
              racers.map((racer) => (
                <DropdownMenuItem key={racer._id} className="cursor-default">
                  {racer.username}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No racers</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const race = row.original;
      
      return (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(race)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-500 hover:text-red-700"
            onClick={() => handleDelete(race._id)}
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      );
    },
  },
];