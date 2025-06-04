"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

import "leaflet-geosearch/dist/geosearch.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

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

interface RaceFormProps {
  race: Race | null;
  onClose: () => void;
}

const BASE_URL = "https://dataapi-qy43.onrender.com";

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  startTime: z.string().min(1, { message: "Start time is required." }),
  endTime: z.string().optional(),
  description: z.string().optional(),
  startingPoint: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
  endingPoint: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    })
    .optional(),
  racers: z.array(z.string()).optional(),
});

const MapClickHandler: React.FC<{
  onCoordinateSelect: (latlng: L.LatLng) => void;
}> = ({ onCoordinateSelect }) => {
  useMapEvents({
    click(e) {
      onCoordinateSelect(e.latlng);
    },
  });
  return null;
};

const SearchControl: React.FC<{ onSearchResult: (latlng: L.LatLng) => void }> = ({ onSearchResult }) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    // Using 'as any' for the constructor to bypass TS7009 if it's the issue
    const searchControl = new (GeoSearchControl as any)({
      provider,
      style: "bar",
      showMarker: true,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: false,
    });

    map.addControl(searchControl);

    // Using 'as any' for the event to access location if types are missing
    map.on("geosearch/showlocation", (result: any) => { // Cast result to 'any'
      // This part is crucial:
      // result.location typically contains:
      //   x: longitude
      //   y: latitude
      //   label: display string
      //   bounds: L.LatLngBounds
      // You need to pass latitude first, then longitude to L.latLng
      const latlng = L.latLng(result.location.y, result.location.x);
      onSearchResult(latlng);
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, onSearchResult]);

  return null;
};

export function RacesForm({ race, onClose }: RaceFormProps) {
  const [error, setError] = useState<string>("");
  const [availableRacers, setAvailableRacers] = useState<Racer[]>([]);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // Initialize react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: race?.name || "",
      startTime: race?.startTime ? new Date(race.startTime).toISOString().slice(0, 16) : "",
      endTime: race?.endTime ? new Date(race.endTime).toISOString().slice(0, 16) : "",
      description: race?.description || "",
      startingPoint: race?.startingPoint,
      endingPoint: race?.endingPoint,
      racers: race?.racers.map((racer) => racer._id) || [],
    },
  });

  useEffect(() => {
    const fetchRacers = async () => {
      try {
        const response = await axios.post(`${BASE_URL}/auth/all`, {}, getAuthHeaders());
        setAvailableRacers(
          response.data.map((user: any) => ({
            _id: user._id,
            username: user.username,
          }))
        );
      } catch (error) {
        console.error("Error fetching racers:", error);
        setError("Failed to load racers.");
      }
    };
    fetchRacers();
  }, []);

  const handleStartPointSelect = (latlng: L.LatLng) => {
    form.setValue("startingPoint", { latitude: latlng.lat, longitude: latlng.lng });
  };

  const handleEndPointSelect = (latlng: L.LatLng) => {
    form.setValue("endingPoint", { latitude: latlng.lat, longitude: latlng.lng });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError("");
    try {
      const payload = {
        ...values,
        startTime: values.startTime ? new Date(values.startTime).toISOString() : null,
        endTime: values.endTime ? new Date(values.endTime).toISOString() : null,
      };

      if (race) {
        await axios.post(
          `${BASE_URL}/raceManagement/update`,
          { id: race._id, ...payload },
          getAuthHeaders()
        );

        const currentRacers = race.racers.map((r) => r._id);
        const racersToAdd = payload.racers?.filter((r) => !currentRacers.includes(r)) || [];
        const racersToRemove = currentRacers.filter((r) => !payload.racers?.includes(r));

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
        await axios.post(`${BASE_URL}/raceManagement/create`, payload, getAuthHeaders());
      }
      onClose();
    } catch (error: any) {
      console.error("Error saving race:", error);
      setError(error.response?.data?.message || "Failed to save race. Please try again.");
    }
  };

  return (
    <div className="p-4 border border-grey rounded-lg mt-6">
      <h2 className="text-lg font-semibold mb-4">{race ? "Edit Race" : "Add Race"}</h2>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Race Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Race Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Starting Point Map */}
          <div>
            <Label>Select Starting Point</Label>
            <div className="h-[300px] my-2 rounded-lg overflow-hidden">
              <MapContainer
                center={[51.505, -0.09]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapClickHandler onCoordinateSelect={handleStartPointSelect} />
                <SearchControl onSearchResult={handleStartPointSelect} />
                {form.watch("startingPoint") && (
                  <Marker
                    position={[
                      form.watch("startingPoint")!.latitude,
                      form.watch("startingPoint")!.longitude,
                    ]}
                  />
                )}
              </MapContainer>
            </div>
            {form.watch("startingPoint") && (
              <p className="text-sm">
                Starting Point: {form.watch("startingPoint")!.latitude.toFixed(4)},{" "}
                {form.watch("startingPoint")!.longitude.toFixed(4)}
              </p>
            )}
          </div>
          {/* Ending Point Map */}
          <div>
            <Label>Select Ending Point</Label>
            <div className="h-[300px] my-2 rounded-lg overflow-hidden">
              <MapContainer
                center={[51.505, -0.09]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapClickHandler onCoordinateSelect={handleEndPointSelect} />
                <SearchControl onSearchResult={handleEndPointSelect} />
                {form.watch("endingPoint") && (
                  <Marker
                    position={[
                      form.watch("endingPoint")!.latitude,
                      form.watch("endingPoint")!.longitude,
                    ]}
                  />
                )}
              </MapContainer>
            </div>
            {form.watch("endingPoint") && (
              <p className="text-sm">
                Ending Point: {form.watch("endingPoint")!.latitude.toFixed(4)},{" "}
                {form.watch("endingPoint")!.longitude.toFixed(4)}
              </p>
            )}
          </div>
          <FormField
            control={form.control}
            name="racers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Racers</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      const current = field.value || [];
                      if (current.includes(value)) {
                        field.onChange(current.filter((id) => id !== value));
                      } else {
                        field.onChange([...current, value]);
                      }
                    }}
                    value=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Racers" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRacers.map((racer) => (
                        <SelectItem
                          key={racer._id}
                          value={racer._id}
                          className={field.value?.includes(racer._id) ? "bg-gray-100" : ""}
                        >
                          {racer.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <div className="mt-2">
                  {field.value?.map((id) => {
                    const racer = availableRacers.find((r) => r._id === id);
                    return racer ? (
                      <span
                        key={id}
                        className="inline-flex items-center px-2 py-1 mr-2 text-sm bg-gray-200 rounded"
                      >
                        {racer.username}
                        <button
                          type="button"
                          onClick={() => field.onChange(field.value?.filter((v) => v !== id))}
                          className="ml-1 text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button type="submit">{race ? "Update" : "Create"}</Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}