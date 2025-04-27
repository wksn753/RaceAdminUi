import React, { useState } from "react";
import UserList from "../components/UserList";
import UserForm from "../components/UserForm";
import { Typography,  Box } from "@mui/material";
import { Button } from "@/components/ui/button"
import {ProfileForm} from "../components/UserManagent/UserFormTemplate";

interface User {
  _id: string;
  username: string;
  type: string;
  createdAt: string;
}

const UsersPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refresh, setRefresh] = useState(false);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedUser(null);
    setRefresh((prev) => !prev);
  };

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Users</Typography>
        <Button  onClick={() => setShowForm(true)}>
          Add User
        </Button>
      </Box>
      {showForm && <ProfileForm user={selectedUser} onClose={handleFormClose} />}
      <UserList onEdit={handleEdit} refresh={refresh} />
    </div>
  );
};

export default UsersPage;