import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import axios from "axios";
import { useState } from "react";
//import { Alert, Button } from "@mui/material";  // Keep your MUI components if needed
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"


interface ProfileFormProps {
  user: User | null;
  onClose: () => void;
  onSuccess?: () => void;
}

interface User {
  _id: string;
  username: string;
  type: string;
  createdAt: string;
}

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  type: z.string().min(2, {
    message: "Type must be at least 2 characters.",
  }),
  password: z.string().optional().refine(val => {
    // Password is required for new users, optional for updates
    return true; // We'll handle this logic in onSubmit
  }),
})

export function ProfileForm({ user, onClose, onSuccess }: ProfileFormProps) {
  const [error, setError] = useState<string>("");
  
  // 1. Define your form with default values from user if editing
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username || "",
      type: user?.type || "",
      password: "", // Always start with empty password
    },
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError("");
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("Authentication required. Please log in.");
        return;
      }
      
      // Set the authorization header
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // For updating existing user
      if (user) {
        // Only send password if provided
        const updateData = {
          username: values.username,
          type: values.type,
          userId: user._id
        };
        
        // Only include password if it's not empty
        if (values.password && values.password.trim() !== '') {
          Object.assign(updateData, { password: values.password });
        }
        
        await axios.post(`https://dataapi-qy43.onrender.com/auth/update`, 
          updateData,
          config
        );
      } else {
        // For creating new users - password is required
        if (!values.password || values.password.trim() === '') {
          setError("Password is required for new users");
          return;
        }
        
        await axios.post("https://dataapi-qy43.onrender.com/auth/register", 
          values, // Send all form values for new user
          config
        );
      }
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error: any) {
      console.error("Error saving user:", error);
      setError(error.response?.data?.message || "Failed to save user. Please try again.");
    }
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="border-grey border p-4 rounded">
      {error && (
        <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Your session has expired. Please log in again.
        </AlertDescription>
      </Alert>
      
      
      )}
      
      {/* Add your form fields using react-hook-form here */}
      {/* For example: */}
      <div className="space-y-4">
        <div>
          <label>Username</label>
          <input {...form.register("username")} className="w-full p-2 border rounded" />
          {form.formState.errors.username && (
            <p className="text-red-500">{form.formState.errors.username.message}</p>
          )}
        </div>
        
        <div>
          <label>Type</label>
          <select {...form.register("type")} className="w-full p-2 border rounded">
            <option value="">Select Type</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="racer">Racer</option>
          </select>
          {form.formState.errors.type && (
            <p className="text-red-500">{form.formState.errors.type.message}</p>
          )}
        </div>
        
        <div>
          <label>Password {user && "(Leave blank to keep current password)"}</label>
          <input 
            type="password"
            {...form.register("password")} 
            className="w-full p-2 border rounded" 
          />
          {form.formState.errors.password && (
            <p className="text-red-500">{form.formState.errors.password.message}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button type="submit"  color="primary">
            {user ? "Update" : "Create"}
          </Button>
          <Button onClick={onClose}  variant="secondary">
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}