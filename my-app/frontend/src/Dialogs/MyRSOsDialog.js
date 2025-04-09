import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
} from "@mui/material";
import axios from "axios";

function MyRSOsDialog({ open, onClose, userId }) {
  const [rsos, setRsos] = useState([]);

  useEffect(() => {
    if (open && userId) {
      axios
        .get(`http://localhost:5000/rsos/user/${userId}`)
        .then((res) => setRsos(res.data))
        .catch((err) => console.error("Error fetching RSOs:", err));
    }
  }, [open, userId]);

  const handleLeave = (rsoId, rsoName) => {
    const confirm = window.confirm(
      `Are you sure you want to leave the RSO "${rsoName}"?`
    );
    if (!confirm) return;

    axios
      .delete(`http://localhost:5000/rsos/leave`, {
        data: { userId, rsoId },
      })
      .then(() => {
        setRsos((prev) => prev.filter((rso) => rso.id !== rsoId));
      })
      .catch((err) => console.error("Error leaving RSO:", err));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>My RSOs</DialogTitle>
      <DialogContent>
        {rsos.length === 0 ? (
          <Typography>You are not part of any RSOs.</Typography>
        ) : (
          <List>
            {rsos.map((rso) => (
              <ListItem key={rso.id} divider>
                <ListItemText primary={rso.name} />
                <Button
                  color="error"
                  onClick={() => handleLeave(rso.id, rso.name)}
                  variant="outlined"
                >
                  Leave
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default MyRSOsDialog;
