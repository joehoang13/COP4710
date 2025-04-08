import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
import axios from 'axios';

function JoinRSODialog({ open, onClose, userId }) {
  const [rsos, setRsos] = useState([]);
  const [selectedRso, setSelectedRso] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch the list of RSOs from the backend
    axios.get('http://localhost:5000/rsos')
      .then((response) => {
        setRsos(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch RSOs');
        setLoading(false);
      });
  }, []);

  const handleSubmit = () => {
    if (!selectedRso) {
      setError('Please select an RSO to join.');
      return;
    }

    // Make API call to join the selected RSO
    axios.post('http://localhost:5000/rso_memberships', { userId, rsoId: selectedRso })
      .then((response) => {
        onClose();  // Close the dialog on success
      })
      .catch((err) => {
        setError('Failed to join RSO. Please try again.');
      });
  };

  const handleClose = () => {
    onClose();
    setError('');
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Join an RSO</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          <FormControl fullWidth>
            <InputLabel>RSOs</InputLabel>
            <Select
              value={selectedRso}
              onChange={(e) => setSelectedRso(e.target.value)}
              label="RSOs"
            >
              {rsos.map((rso) => (
                <MenuItem key={rso.id} value={rso.id}>
                  {rso.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Join RSO
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default JoinRSODialog;
