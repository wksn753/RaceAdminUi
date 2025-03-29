import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography, MenuItem } from "@mui/material";
import { User } from "../types";

interface UserFormProps {
  user: User | null;
  onClose: () => void;
}
const UserForm: React.FC<UserFormProps> = ({ user, onClose }) => {
    const [formData, setFormData] = useState({
      username: "",
      password: "",
      type: "",
    });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: "", // Don't prefill password for security
        type: user.type || "",
      });
    }
  }, [user]);

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
    try {
      if (user) {
        await axios.put(`http://localhost:3000/api/users/${user._id}`, formData);
      } else {
        await axios.post("http://localhost:3000/api/users", formData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
      <Typography variant="h6">{user ? "Edit User" : "Add User"}</Typography>
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
        required={!user} // Password required only for new users
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