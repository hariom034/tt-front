import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Typography } from "@mui/material";
import { sendOtp, verifyOtp } from "../api/authApi";
import { useAuthStore } from "../store/authStore";
import Grid from "@mui/material/Grid";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [email, setemail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    "& .MuiFilledInput-root": {
      backgroundColor: "rgba(255,255,255,0.08)",
      "&:hover": {
        backgroundColor: "rgba(255,255,255,0.12) !important",
      },
      "&.Mui-focused": {
        backgroundColor: "rgba(255,255,255,0.12) !important",
      },
      "&:before": {
        borderBottom: "1px solid rgba(255,255,255,0.5)",
      },
      "&:hover:not(.Mui-disabled, .Mui-error):before": {
        borderBottom: "2px solid #ffffff",
      },
      "&:after": {
        borderBottom: "2px solid #ffffff",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#ffffff",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#ffffff",
    },
    "& .MuiFilledInput-input": {
      color: "#ffffff",
    },
  };

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
    <Grid container>
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
        <img
          src="/logo.png"
          alt="Background"
          style={{ width: "290px", height: "300px" }}
        />
      </Grid>

      <Grid item md={4} sx={{ p: 0, m: 0 }}>
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
      </Grid>
    </Grid>
  );
}
