import React, { useState, useEffect } from "react";
import axios from "axios";
import {DataTable} from "../components/data-table";
import {UserColumns} from "../types/Users";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Alert,
  CircularProgress,
  Box
} from "@mui/material";

interface User {
  _id: string;
  username: string;
  type: string;
  createdAt: string;
}

interface UserListProps {
  onEdit: (user: User) => void;
  refresh: boolean;
}

const UserList: React.FC<UserListProps> = ({ onEdit, refresh }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError("Authentication required. Please log in.");
          setLoading(false);
          return;
        }
        
        // Set up authorization header
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Based on your auth.js routes, use the correct endpoint
        // Using POST and /auth/all endpoint as per your API
        const response = await axios.post(
          "https://dataapi-qy43.onrender.com/auth/all", 
          {}, // Empty body for POST request
          config
        );
        
        setUsers(response.data);
      } catch (error: any) {
        console.error("Error fetching users:", error);
        setError(error.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [refresh]);

  const handleDelete = async (id: string) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("Authentication required. Please log in.");
        return;
      }
      
      // Set up authorization header
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Based on your auth.js routes, use the correct endpoint
      // Using POST and /auth/delete endpoint with userId in body
      await axios.post(
        "https://dataapi-qy43.onrender.com/auth/delete", 
        { userId: id },
        config
      );
      
      // Update local state
      setUsers(users.filter((user) => user._id !== id));
    } catch (error: any) {
      console.error("Error deleting user:", error);
      setError(error.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }
  const UserColumnsData = UserColumns(onEdit, handleDelete);

  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {/* <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No users found</TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.type || "N/A"}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button onClick={() => onEdit(user)} color="primary">
                      Edit
                    </Button>
                    <Button onClick={() => handleDelete(user._id)} color="error">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer> */}

    <div className="container mx-auto py-10">
      <DataTable columns={UserColumnsData} data={users} />
    </div>
    </>
  );
};

export default UserList;