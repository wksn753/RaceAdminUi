import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography, MenuItem, Alert } from "@mui/material";

interface User {
  _id: string;
  username: string;
  type: string;
  createdAt: string;
}

interface UserFormProps {
  user: User | null;
  onClose: () => void;
  onSuccess?: () => void; // Callback for when operation succeeds
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    type: "",
  });
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: "",
        type: user.type || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // Set the authorization header
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      if (user) {
        // For updating users - note: your endpoint looks unusual, check if it's correct
        // Typically update endpoints would be /auth/update or /auth/users/:id
        await axios.post(`https://dataapi-qy43.onrender.com/auth/update`, 
          {
            ...formData,
            userId: user._id // Make sure this matches what your API expects
          },
          config
        );
      } else {
        // For creating new users
        await axios.post("https://dataapi-qy43.onrender.com/auth/register", 
          formData,
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
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
      <Typography variant="h6">{user ? "Edit User" : "Add User"}</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        label="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required={!user}
        helperText={user ? "Leave blank to keep current password" : ""}
      />
      <TextField
        label="Type"
        name="type"
        select
        value={formData.type}
        onChange={handleChange}
        fullWidth
        margin="normal"
      >
        <MenuItem value="">None</MenuItem>
        <MenuItem value="admin">Admin</MenuItem>
        <MenuItem value="user">User</MenuItem>
        <MenuItem value="racer">Racer</MenuItem>
      </TextField>
      <Box mt={2}>
        <Button type="submit" variant="contained" color="primary">
          {user ? "Update" : "Create"}
        </Button>
        <Button onClick={onClose} variant="outlined" color="secondary" sx={{ ml: 2 }}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default UserForm;