import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import axios from "axios";

function LoginDialog({ open, onClose, onLoginSuccess }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setUsername("");
      setPassword("");
    }
  }, [open]);

  const handleLogin = () => {
    setError("");

    axios
      .post("http://localhost:5000/login", { username, password })
      .then((response) => {
        console.log("Login successful", response.data);
        const { userId, role, username, email } = response.data;
        const user = {
          userId,
          role,
          username,
          email,
        };
        localStorage.setItem("user", JSON.stringify(user));

        navigate("/welcome");

        onClose();
      })
      .catch((error) => {
        console.error("Error during login:", error);
        setError("Invalid username or password");
      });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Login</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Username"
          fullWidth
          variant="standard"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Password"
          type="password"
          fullWidth
          variant="standard"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div style={{ color: "red", marginTop: "10px" }}>{error}</div>
        )}{" "}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleLogin}>Login</Button>
      </DialogActions>
    </Dialog>
  );
}

export default LoginDialog;
