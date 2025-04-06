import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, MenuItem } from '@mui/material';
import axios from 'axios';

function RegisterDialog({ open, onClose }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('Student'); // Default role
    const [passwordError, setPasswordError] = useState('');
  
    const validatePassword = (password) => {
      const passwordPattern = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~\-]{8,}$/;
      return passwordPattern.test(password);
    };
  
    const handleRegister = () => {
      if (!validatePassword(password)) {
        setPasswordError('Password must be at least 8 characters long, contain an uppercase letter, and a number.');
        return;
      }
  
      setPasswordError('');
  
      axios.post('http://localhost:5000/register', { username, password, firstName, lastName, role }, {
        headers: { 'Content-Type': 'application/json' }
      })
        .then(response => {
          console.log('Registration successful', response.data);
          onClose(); // Close dialog after successful registration
        })
        .catch(error => {
          console.error('Error during registration:', error);
        });
    };
  
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Register</DialogTitle>
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
          <Typography color="error">{passwordError}</Typography>
          <TextField
            margin="dense"
            label="First Name"
            fullWidth
            variant="standard"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Last Name"
            fullWidth
            variant="standard"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            select
            margin="dense"
            label="Role"
            fullWidth
            variant="standard"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Student">Student</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleRegister}>Submit</Button>
        </DialogActions>
      </Dialog>
    );
  }
  
  export default RegisterDialog;