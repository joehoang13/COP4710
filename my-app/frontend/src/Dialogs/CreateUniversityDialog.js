import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import axios from 'axios';

function CreateUniversityDialog({ open, onClose }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [numStudents, setnumStudents] = useState('');

  const handleCreate = () => {
    const universityData = {
      name,
      location,
      description,
      numberOfStudents: parseInt(numStudents, 10),
    };

    axios.post('http://localhost:5000/universities', universityData)
      .then(response => {
        console.log('University created:', response.data);
        handleClose();
      })
      .catch(error => {
        console.error('Error creating university:', error);
      });
  };

  const handleClose = () => {
    setName('');
    setLocation('');
    setDescription('');
    setnumStudents('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>Create a New University</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="University Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Location"
          fullWidth
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Number of Students"
          type="number"
          fullWidth
          value={numStudents}
          onChange={(e) => setnumStudents(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">Cancel</Button>
        <Button onClick={handleCreate} color="primary" variant="contained">Create</Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateUniversityDialog;
