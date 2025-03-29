import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Container, Button } from "@mui/material";
import UsersPage from "./pages/UsersPage";
import RacesPage from "./pages/RacesPage";
import "./App.css";

const App: React.FC = () => {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Racer Admin Dashboard
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Users
          </Button>
          <Button color="inherit" component={Link} to="/races">
            Races
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<UsersPage />} />
          <Route path="/races" element={<RacesPage />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;