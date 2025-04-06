import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Button } from '@mui/material';
import axios from 'axios';
import LoginDialog from '../Dialogs/LoginDialog';  // Import the LoginDialog component
import RegisterDialog from '../Dialogs/RegisterDialog';  // Import the RegisterDialog component
import AuthButtons from '../Buttons/AuthButtons';  // Import the AuthButtons component

function LoginPage() {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);

  // Functions to open dialogs
  const handleClickOpenLogin = () => setOpenLogin(true);
  const handleCloseLogin = () => setOpenLogin(false);
  
  const handleClickOpenRegister = () => setOpenRegister(true);
  const handleCloseRegister = () => setOpenRegister(false);

  return (
    <div className="container">
      <div className="content">
        <Typography variant="h2" className="header">Colleve Events</Typography>
        <Typography variant="h6" className="description">
          Colleve Events helps UCF students find and keep track of fun and exciting events happening on campus. Whether you're looking for something to do with friends or an event to attend on your own, we have you covered!
        </Typography>

        {/* Login and Register Buttons */}
        <div className="buttons">
          {/* Login Button */}
          <Button variant="contained" onClick={handleClickOpenLogin} className="button">
            Login
          </Button>

          {/* Register Button */}
          <Button variant="contained" onClick={handleClickOpenRegister} className="button">
            Register
          </Button>
        </div>

        {/* Login Dialog */}
        <LoginDialog open={openLogin} onClose={handleCloseLogin} />

        {/* Register Dialog */}
        <RegisterDialog open={openRegister} onClose={handleCloseRegister} />
      </div>
    </div>
  );
}

export default LoginPage;