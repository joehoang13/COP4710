import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

const CreateRSODialog = ({
  open,
  onClose,
  currentUserId,
  currentUserEmail,
}) => {
  const [universities, setUniversities] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [emails, setEmails] = useState([currentUserEmail]);

  useEffect(() => {
    if (open) {
      axios
        .get("http://localhost:5000/universities")
        .then((response) => {
          setUniversities(response.data);
        })
        .catch((error) => {
          console.error("Error fetching universities:", error);
        });
    }
  }, [open]);

  const handleCreateRSO = () => {
    if (!name || !description || !selectedUniversity || emails.length === 0) {
      alert("Please fill in all fields and add at least one student email.");
      return;
    }

    const currentUserDomain = currentUserEmail.split("@")[1];

    // Count how many emails have the same domain as the admin
    const sameDomainEmails = emails.filter(
      (email) => email.split("@")[1] === currentUserDomain
    );

    if (sameDomainEmails.length < 5) {
      alert(
        "You need at least 5 members with the same email domain as the admin to create an RSO."
      );
      return;
    }

    axios
      .post("http://localhost:5000/rsos", {
        name,
        description,
        universityId: selectedUniversity,
        adminId: currentUserId,
        studentEmails: emails,
      })
      .then((response) => {
        console.log(response.data);

        // Once the RSO is created, update the user's role to admin (role 2)
        axios
          .put(`http://localhost:5000/users/${currentUserId}`, { role: 2 })
          .then(() => {
            console.log("User role updated to admin");
            handleClose();
          })
          .catch((error) => {
            console.error("Error updating user role:", error);
            alert("Failed to update user role to admin.");
          });
      })
      .catch((error) => {
        console.error("Error creating RSO:", error);
        alert(
          "Failed to create RSO. Ensure that at least 5 members have the same email domain as the admin."
        );
      });
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setSelectedUniversity("");
    setEmails([currentUserEmail]); // Include admin's email
    onClose();
  };

  const handleAddEmail = () => {
    const emailInput = document.getElementById("email-input").value;
    if (emailInput && !emails.includes(emailInput)) {
      setEmails([...emails, emailInput]);
    }
    document.getElementById("email-input").value = "";
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create RSO</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="RSO Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          select
          margin="dense"
          label="Select University"
          fullWidth
          value={selectedUniversity}
          onChange={(e) => setSelectedUniversity(e.target.value)}
        >
          {universities.map((uni) => (
            <MenuItem key={uni.id} value={uni.id}>
              {uni.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          id="email-input"
          margin="dense"
          label="Add Student Email"
          fullWidth
          onKeyPress={(e) => {
            if (e.key === "Enter") handleAddEmail();
          }}
        />
        <Button onClick={handleAddEmail} variant="contained" sx={{ mt: 1 }}>
          Add Email
        </Button>

        <List sx={{ mt: 2 }}>
          {emails.length > 0 &&
            emails.map((email, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveEmail(email)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={email} />
              </ListItem>
            ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleCreateRSO} variant="contained" color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRSODialog;
