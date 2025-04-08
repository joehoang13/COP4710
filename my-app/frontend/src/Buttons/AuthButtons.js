import React from "react";
import { Button } from "@mui/material";

function AuthButtons({ onLoginClick, onRegisterClick }) {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <Button
        variant="contained"
        onClick={onLoginClick}
        style={{ marginRight: "20px" }}
      >
        Login
      </Button>

      <Button variant="contained" onClick={onRegisterClick}>
        Register
      </Button>
    </div>
  );
}

export default AuthButtons;
