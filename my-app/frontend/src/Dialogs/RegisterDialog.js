import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, MenuItem } from '@mui/material';
import axios from 'axios';

function RegisterDialog({ open, onClose }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('Student'); // Default role
    const [email, setEmail] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [universities, setUniversities] = useState([]); // State to store universities
    const [selectedUniversity, setSelectedUniversity] = useState(''); // Selected university

    // Fetch universities when dialog opens
    useEffect(() => {
        axios.get('http://localhost:5000/universities')
            .then(response => {
                setUniversities(response.data);
            })
            .catch(error => {
                console.error('Error fetching universities:', error);
            });
    }, [open]);

    const validatePassword = (password) => {
      const passwordPattern = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~\-]{8,}$/;
      return passwordPattern.test(password);
    };

    const validateEmail = (email) => {
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      return emailPattern.test(email);
    };

    const handleRegister = () => {
      if (!validatePassword(password)) {
        setPasswordError('Password must be at least 8 characters long, contain an uppercase letter, and a number.');
        return;
      }

      if (!validateEmail(email)) {
        setPasswordError('Please enter a valid email.');
        return;
      }

      if (!selectedUniversity) {
        setPasswordError('Please select a university.');
        return;
      }

      setPasswordError('');

      axios.post('http://localhost:5000/register', { username, password, firstName, lastName, role, email, universityId: selectedUniversity }, {
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
            label="Email"
            fullWidth
            variant="standard"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          
          {/* University Selection */}
          <TextField
            select
            margin="dense"
            label="University"
            fullWidth
            variant="standard"
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
          >
            {universities.map((uni) => (
              <MenuItem key={uni.id} value={uni.id}>
                {uni.name}
              </MenuItem>
            ))}
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
