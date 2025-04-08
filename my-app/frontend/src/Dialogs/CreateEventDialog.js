import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Button, MenuItem, Select, InputLabel,
  FormControl, Box
} from '@mui/material';
import axios from 'axios';
import {
  GoogleMap,
  Marker,
  Autocomplete
} from '@react-google-maps/api';

const mapContainerStyle = {
  height: '300px',
  width: '100%',
};

const defaultCenter = {
  lat: 28.6024,
  lng: -81.2001,
};

function CreateEventDialog({ open, onClose, userId, userEmail }) {
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [eventTypeId, setEventTypeId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState(userEmail); // Default to user's email
  
  const [universities, setUniversities] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [rsos, setRsos] = useState([]);
  
  const [selectedLocation, setSelectedLocation] = useState({
    name: '',
    address: '',
    lat: null,
    lng: null,
  });

  const autocompleteRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [rsoId, setRsoId] = useState(''); // State to store the selected RSO

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uniRes, typeRes, rsoRes] = await Promise.all([
          axios.get('http://localhost:5000/universities'),
          axios.get('http://localhost:5000/event-types'),
          axios.get(`http://localhost:5000/rsos/user/${userId}`) // Fetch RSOs for the user
        ]);
        setUniversities(uniRes.data);
        setEventTypes(typeRes.data);
        setRsos(rsoRes.data); // Set the user's RSOs
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchData();
  }, [userId]);

  const validateFields = () => {
    const newErrors = {};

    if (!eventName.trim()) newErrors.eventName = 'This field cannot be blank';
    if (!eventDescription.trim()) newErrors.eventDescription = 'This field cannot be blank';
    if (!universityId) newErrors.universityId = 'This field cannot be blank';
    if (!eventTypeId) newErrors.eventTypeId = 'This field cannot be blank';
    if (!startTime) newErrors.startTime = 'This field cannot be blank';

    if (!endTime) {
      newErrors.endTime = 'This field cannot be blank';
    } else if (startTime && new Date(endTime) <= new Date(startTime)) {
      newErrors.endTime = 'End time must be after start time';
    }

    if (!selectedLocation || !selectedLocation.name) {
      newErrors.selectedLocation = 'Please select a location from the search';
    }

    if (!contactPhone.trim()) newErrors.contactPhone = 'Please provide a contact phone number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;
  
    try {
      const newEvent = {
        name: eventName,
        description: eventDescription,
        university_id: universityId,
        event_type_id: eventTypeId,
        start_time: startTime,
        end_time: endTime,
        visibility,
        created_by: userId,
        location: {
          name: selectedLocation.name,
          address: selectedLocation.address,
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng
        },
        rso_id: rsoId || null, // Include the RSO id if selected
        contact_email: contactEmail, // Use the contact email value (can be modified)
        contact_phone_number: contactPhone
      };
  
      // Send the event data to the backend API
      const response = await axios.post('http://localhost:5000/events', newEvent);
      
      // Check if the response is successful
      if (response.status === 201) {
        console.log('Event created successfully');
        onClose();  // Close the dialog after successful event creation
      }
    } catch (error) {
      console.error('Error creating event:', error);
  
      // Check if the error response has the trigger message
      if (error.response && error.response.data && error.response.data.error) {
        // Show an alert with the trigger error message
        alert(error.response.data.error);
      } else {
        // General error handling if no specific message from trigger
        alert('An error occurred while creating the event.');
      }
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Event</DialogTitle>
      <DialogContent sx={{ overflow: 'visible' }}>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            fullWidth
            error={!!errors.eventName}
            helperText={errors.eventName}
          />
          <TextField
            label="Event Description"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            multiline
            rows={4}
            fullWidth
            error={!!errors.eventDescription}
            helperText={errors.eventDescription}
          />
          <FormControl fullWidth error={!!errors.universityId}>
            <InputLabel>University</InputLabel>
            <Select
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              label="University"
            >
              {universities.map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
              ))}
            </Select>
            {errors.universityId && <Box color="error.main" mt={0.5} fontSize="0.75rem">{errors.universityId}</Box>}
          </FormControl>
          <FormControl fullWidth error={!!errors.eventTypeId}>
            <InputLabel>Event Type</InputLabel>
            <Select
              value={eventTypeId}
              onChange={(e) => setEventTypeId(e.target.value)}
              label="Event Type"
            >
              {eventTypes.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </Select>
            {errors.eventTypeId && <Box color="error.main" mt={0.5} fontSize="0.75rem">{errors.eventTypeId}</Box>}
          </FormControl>

          {/* Move Visibility here */}
          <FormControl fullWidth>
            <InputLabel>Visibility</InputLabel>
            <Select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              label="Visibility"
            >
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="rso">RSO</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>RSO (Optional)</InputLabel>
            <Select
              value={rsoId}
              onChange={(e) => setRsoId(e.target.value)}
              label="RSO (Optional)"
            >
              <MenuItem value="">None</MenuItem> {/* Option for no RSO */}
              {rsos.map((rso) => (
                <MenuItem key={rso.id} value={rso.id}>{rso.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Autocomplete
            onLoad={(ref) => (autocompleteRef.current = ref)}
            onPlaceChanged={() => {
              const place = autocompleteRef.current.getPlace();
              if (place && place.geometry) {
                const location = place.geometry.location;
                setSelectedLocation({
                  name: place.name || '',
                  address: place.formatted_address || '',
                  lat: location.lat(),
                  lng: location.lng(),
                });
              }
            }}
          >
            <TextField
              fullWidth
              label="Search Location"
              placeholder="Type location"
              error={!!errors.selectedLocation}
              helperText={errors.selectedLocation}
            />
          </Autocomplete>

          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={14}
            center={selectedLocation.lat ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : defaultCenter}
            onClick={(e) => {
              setSelectedLocation({
                ...selectedLocation,
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
              });
            }}
          >
            {selectedLocation.lat && selectedLocation.lng && (
              <Marker position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }} />
            )}
          </GoogleMap>

          <TextField
            label="Start Time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            error={!!errors.startTime}
            helperText={errors.startTime}
          />
          <TextField
            label="End Time"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            error={!!errors.endTime}
            helperText={errors.endTime}
          />
          <TextField
            label="Contact Phone"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            fullWidth
            error={!!errors.contactPhone}
            helperText={errors.contactPhone}
          />
          <TextField
            label="Contact Email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            fullWidth
            error={!!errors.contactEmail}
            helperText={errors.contactEmail}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Create Event
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateEventDialog;
