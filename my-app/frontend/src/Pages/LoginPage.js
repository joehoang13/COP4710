import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import axios from "axios";
import LoginDialog from "../Dialogs/LoginDialog";
import RegisterDialog from "../Dialogs/RegisterDialog";
import AuthButtons from "../Buttons/AuthButtons";

function LoginPage() {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);

  const handleClickOpenLogin = () => setOpenLogin(true);
  const handleCloseLogin = () => setOpenLogin(false);

  const handleClickOpenRegister = () => setOpenRegister(true);
  const handleCloseRegister = () => setOpenRegister(false);

  return (
    <div className="container">
      <div className="content">
        <Typography variant="h2" className="header">
          Colleve Events
        </Typography>
        <Typography variant="h6" className="description">
          Colleve Events helps UCF students find and keep track of fun and
          exciting events happening on campus. Whether you're looking for
          something to do with friends or an event to attend on your own, we
          have you covered!
        </Typography>

        <div className="buttons">
          <Button
            variant="contained"
            onClick={handleClickOpenLogin}
            className="button"
          >
            Login
          </Button>

          <Button
            variant="contained"
            onClick={handleClickOpenRegister}
            className="button"
          >
            Register
          </Button>
        </div>

        <LoginDialog open={openLogin} onClose={handleCloseLogin} />

        <RegisterDialog open={openRegister} onClose={handleCloseRegister} />
      </div>
    </div>
  );
}

export default LoginPage;
