import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import { User } from "../types";

interface UserListProps {
  onEdit: (user: User) => void;
  refresh: boolean;
}
const UserList: React.FC<UserListProps> = ({ onEdit, refresh }) => {
    const [users, setUsers] = useState<User[]>([]);
  
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await axios.get<User[]>("http://localhost:3000/api/users");
          setUsers(response.data);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
      fetchUsers();
    }, [refresh]);
  
    const handleDelete = async (id: string) => {
      try {
        await axios.delete(`http://localhost:3000/api/users/${id}`);
        setUsers(users.filter((user) => user._id !== id));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    };
    return (
    <TableContainer component={Paper}>
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
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.type || "N/A"}</TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
              <TableCell>
                <Button onClick={() => onEdit(user)} color="primary">
                  Edit
                </Button>
                <Button onClick={() => handleDelete(user._id)} color="secondary">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserList;