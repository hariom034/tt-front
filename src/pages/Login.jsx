import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, Divider, Grid, Skeleton, Stack } from "@mui/material";
import { sendOtp, verifyOtp } from "../api/authApi";
import { useAuthStore } from "../store/authStore";
import { inputStyle } from "../helpers/styleHelper";


export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [email, setemail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setMessage("Please enter your email number.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await sendOtp(email);
      setStep("otp");
      setMessage("OTP sent successfully. Please enter the code.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !otp.trim()) {
      setMessage("Please enter your email number and OTP.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await verifyOtp(email, otp);
      const { accessToken, user } = response?.data?.data || {};

      login(user, accessToken);
      setMessage("Login successful.");
      navigate("/");
    } catch (err) {
      setMessage(
        err?.response?.data?.message || "Invalid OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-page">

      <Stack
        direction="row"
        sx={{
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div style={{
          width: "100%",
          minHeight: "100vh",
          position: "relative",
          backgroundImage: "url('/leaf_bg.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            top: "20px",
            left: "20px",
            color: "#ffffff",
            fontSize: "24px",
            fontWeight: "bold",
          }}>
            <img
              src="/logo.png"
              alt="Background"
              style={{ width: "160px", height: "150px" }}
              />
            <h2 style={{ color: "#ffffff", margin: "0" }}>Velora</h2>
          </div>

        </div>



        <div className="login">
          <Typography variant="h4" sx={{ color: "#ffffff", mb: 2 }}>
            Login
          </Typography>

          {message ? (
            <Typography variant="body2" sx={{ color: "#ffffff", mb: 2 }}>
              {message}
            </Typography>
          ) : null}

          <TextField
            variant="filled"
            fullWidth
            label="Email"
            margin="normal"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            sx={inputStyle}
          />

          {step === "otp" ? (
            <TextField
              variant="filled"
              fullWidth
              label="OTP"
              margin="normal"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              sx={inputStyle}
            />
          ) : null}

          {step === "email" ? (
            <Button
              fullWidth
              variant="contained"
              onClick={handleSendOtp}
              disabled={loading}
              sx={{
                mt: 2,
                bgcolor: "#ffffff",
                color: "#E94057",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#ffffff",
                },
              }}
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          ) : (
            <>
              <Button
                fullWidth
                variant="contained"
                onClick={handleLogin}
                disabled={loading}
                sx={{
                  mt: 2,
                  bgcolor: "#ffffff",
                  color: "#E94057",
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "#ffffff",
                  },
                }}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => setStep("email")}
                sx={{ mt: 1, color: "#ffffff", textTransform: "none" }}
              >
                Change email number
              </Button>
            </>
          )}
        </div>

      </Stack>

      {/* <Grid container
        sx={{
          width: "100%"
        }}>
        <Grid
          item
          md={8}
          sx={{
            p: 0,
            m: 0,
            minHeight: "100vh",
            position: "relative",
            backgroundImage: "url('/leaf_bg.png')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
         
        </Grid>

        <Grid item md={4} sx={{ p: 0, m: 0 }}>
        </Grid>
      </Grid> */}
    </Box>
  );
}
