import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  AppBar,
  Toolbar,
  Container,
  Button,
  Paper,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import CreateEventDialog from '../Dialogs/CreateEventDialog';
import CreateUniversityDialog from '../Dialogs/CreateUniversityDialog';
import CreateRSODialog from '../Dialogs/CreateRSODialog';
import JoinRSODialog from '../Dialogs/JoinRSODialog'; 

function WelcomePage() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(null);
  const navigate = useNavigate();

  const toggleDrawer = () => setOpen(!open);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    if (userInfo) {
      setUser(userInfo);
    }
  }, []);

  const handleMenuClick = (option) => {
    switch (option) {
      case 'create-university':
        setOpenDialog('create-university');
        break;
      case 'create-rso':
        setOpenDialog('create-rso');
        break;
      case 'join-rso':
        setOpenDialog('join-rso');
        break;
      case 'create-event':
        setOpenDialog('create-event');
        break;
      case 'view-events':
        navigate('/view-events');
        break;
      default:
        break;
    }
    setOpen(false);
  };

  const handleCloseDialog = () => setOpenDialog(null);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <div
      style={{
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        paddingTop: '64px',
      }}
    >
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Welcome {user ? user.username : 'Guest'}
          </Typography>
          {user && (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer open={open} onClose={toggleDrawer}>
        <List>
          {user && user.role === 1 && (
            <ListItem button onClick={() => handleMenuClick('create-university')}>
              <ListItemText primary="Create University" />
            </ListItem>
          )}
          {user && (
            <ListItem button onClick={() => handleMenuClick('create-rso')}>
              <ListItemText primary="Create RSO" />
            </ListItem>
          )}
          {user && (
            <ListItem button onClick={() => handleMenuClick('join-rso')}>
              <ListItemText primary="Join RSO" />
            </ListItem>
          )}
          {user && user.role < 3 && (
            <ListItem button onClick={() => handleMenuClick('create-event')}>
              <ListItemText primary="Create Event" />
            </ListItem>
          )}
          <ListItem button onClick={() => handleMenuClick('view-events')}>
            <ListItemText primary="View Events" />
          </ListItem>
        </List>
      </Drawer>

      <Container sx={{ mt: 8 }}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          <Typography variant="h4" gutterBottom>
            Welcome to the Events Platform, {user ? user.username : 'Guest'}!
          </Typography>
          <Typography variant="body1">
            Use the menu icon to create or join RSOs, create universities and events, or browse available ones.
          </Typography>
        </Paper>
      </Container>

      {openDialog === 'create-university' && (
        <CreateUniversityDialog open={true} onClose={handleCloseDialog} />
      )}
      {openDialog === 'create-rso' && (
        <CreateRSODialog
          open={true}
          onClose={handleCloseDialog}
          currentUserId={user?.userId}
          currentUserEmail={user?.email}
        />
      )}
      {openDialog === 'join-rso' && (
        <JoinRSODialog
          open={true}
          onClose={handleCloseDialog}
          userId={user?.userId}
        />
      )}
      {openDialog === 'create-event' && (
        <CreateEventDialog
          open={true}
          onClose={handleCloseDialog}
          userId={user?.userId}
          userEmail={user?.email}
        />
      )}
    </div>
  );
}

export default WelcomePage;
