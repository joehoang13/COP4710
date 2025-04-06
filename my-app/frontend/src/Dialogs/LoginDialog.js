import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import axios from 'axios';

function LoginDialog({ open, onClose, onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    useEffect(() => {
        if (!open) {
          setUsername('');
          setPassword('');
        }
      }, [open]);

    const handleLogin = () => {
      // Reset any previous error message
      setError('');
  
      // Make the login request
      axios
        .post('http://localhost:5000/login', { username, password })
        .then((response) => {
          console.log('Login successful', response.data);
          onClose();  // Close the dialog on successful login
        })
        .catch((error) => {
          console.error('Error during login:', error);
          setError('Invalid username or password');  // Show error to the user
        });
    
        window.location.href = '/welcome';
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
          {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}  {/* Error message */}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleLogin}>Login</Button>
        </DialogActions>
      </Dialog>
    );
  }
  
  export default LoginDialog;