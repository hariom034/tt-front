import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
import Filter from "../components/Filter";
import PostCard from "../components/PostCard";
import { apiGet, apiPost } from "../api/api";
import { useState, useEffect } from "react";
import CompleteProfile from "./CompleteProfile";

function hasUserLocation(profileUser = {}) {
  const latitude =
    profileUser?.latitude ??
    profileUser?.lat ??
    profileUser?.location?.latitude ??
    profileUser?.location?.lat ??
    profileUser?.location?.coordinates?.latitude ??
    profileUser?.location?.coordinates?.lat ??
    profileUser?.coordinates?.latitude ??
    profileUser?.coordinates?.lat;

  const longitude =
    profileUser?.longitude ??
    profileUser?.lng ??
    profileUser?.location?.longitude ??
    profileUser?.location?.lng ??
    profileUser?.location?.coordinates?.longitude ??
    profileUser?.location?.coordinates?.lng ??
    profileUser?.coordinates?.longitude ??
    profileUser?.coordinates?.lng;

  return (
    latitude !== undefined &&
    latitude !== null &&
    latitude !== "" &&
    longitude !== undefined &&
    longitude !== null &&
    longitude !== "" &&
    !Number.isNaN(Number(latitude)) &&
    !Number.isNaN(Number(longitude))
  );
}

async function getLocationPermissionState() {
  if (!("geolocation" in navigator)) {
    return "unsupported";
  }

  if (!navigator.permissions || typeof navigator.permissions.query !== "function") {
    return "unknown";
  }

  try {
    const permissionStatus = await navigator.permissions.query({
      name: "geolocation",
    });
    return permissionStatus.state;
  } catch (error) {
    console.error("Error checking geolocation permission:", error);
    return "unknown";
  }
}

const MATCH_SUGGESTIONS_CACHE_KEY = "matchSuggestionsCache";
const MATCH_SUGGESTIONS_CACHE_TTL = 5 * 60 * 1000;

function readMatchSuggestionsCache() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const cached = window.localStorage.getItem(MATCH_SUGGESTIONS_CACHE_KEY);
    if (!cached) {
      return null;
    }

    const parsed = JSON.parse(cached);
    const now = Date.now();

    if (!parsed?.data || !parsed?.timestamp) {
      return null;
    }

    if (now - parsed.timestamp > MATCH_SUGGESTIONS_CACHE_TTL) {
      window.localStorage.removeItem(MATCH_SUGGESTIONS_CACHE_KEY);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error("Error reading match suggestions cache:", error);
    return null;
  }
}

function writeMatchSuggestionsCache(data) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      MATCH_SUGGESTIONS_CACHE_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error("Error writing match suggestions cache:", error);
  }
}

function renderLocationGate({
  profileUser,
  locationLoading,
  locationError,
  onUseLocation,
}) {
  if (profileUser?.profileStage !== "completed") {
    return null;
  }

  if (!hasUserLocation(profileUser)) {
    return (
      <LocationPrompt
        loading={locationLoading}
        error={locationError}
        onUseLocation={onUseLocation}
      />
    );
  }

  return null;
}

export default function Main() {
  const [profileUser, setProfileUser] = useState(null);
  const [matchSuggestions, setMatchSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const response = (await apiGet("/get/front-details")).data;
        console.log("Main fetchProfile response:", response);
        if (response.success) {
          setProfileUser(response.data || {});
        } else {
          setProfileUser({});
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfileUser({});
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  useEffect(() => {
    async function fetchMatchSuggestions() {
      const cachedSuggestions = readMatchSuggestionsCache();

      console.log("cachedSuggestions",cachedSuggestions);

      if (Array.isArray(cachedSuggestions) && cachedSuggestions.length) {
        setMatchSuggestions(cachedSuggestions);
        return;
      }

      try {
        const response = await apiGet("/get/random-profiles", { limit: 20 });
        const payload = response?.data?.data?.profiles ?? response?.data?.profiles ?? [];
        const suggestions = Array.isArray(payload) ? payload : [];

        setMatchSuggestions(suggestions);
        writeMatchSuggestionsCache(suggestions);
        console.log("Match suggestions response:", response?.data);
      } catch (error) {
        console.error("Error fetching match suggestions:", error);
        setMatchSuggestions([]);
      }
    }

    fetchMatchSuggestions();
  }, []);

  useEffect(() => {
    if (!profileUser || profileUser.profileStage !== "completed") {
      return;
    }

    if (hasUserLocation(profileUser)) {
      return;
    }

    let isMounted = true;

    async function autoFetchLocationIfGranted() {
      const permissionState = await getLocationPermissionState();

      if (!isMounted || permissionState !== "granted") {
        return;
      }

      handleUseLocation();
    }

    autoFetchLocationIfGranted();

    return () => {
      isMounted = false;
    };
  }, [profileUser?.profileStage, profileUser?.latitude, profileUser?.longitude]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("This browser does not support geolocation.");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const nextLatitude = coords.latitude;
        const nextLongitude = coords.longitude;

        try {
          await apiPost("/save-location", {
            latitude: nextLatitude,
            longitude: nextLongitude,
          });

          setProfileUser((currentUser) => ({
            ...currentUser,
            latitude: nextLatitude,
            longitude: nextLongitude,
            location: {
              ...(currentUser?.location || {}),
              latitude: nextLatitude,
              longitude: nextLongitude,
            },
          }));
        } catch (error) {
          console.error("Error saving location:", error);
          setLocationError(
            "Location could not be saved. Please try again."
          );
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error("Location access error:", error);
        setLocationError(
          "Location access was blocked. Please allow location access to continue."
        );
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const locationGate = renderLocationGate({
    profileUser,
    locationLoading,
    locationError,
    onUseLocation: handleUseLocation,
  });

  console.log("Main profileUser:", profileUser);
  console.log("Match suggestions:", matchSuggestions);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background:
            "radial-gradient(circle at top, rgba(167, 139, 250, 0.18), transparent 35%), linear-gradient(135deg, #091214 0%, #0d1719 35%, #111827 100%)",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress
            size={42}
            sx={{
              color: "#d8b4fe",
              filter: "drop-shadow(0 0 18px rgba(216,180,254,0.5))",
            }}
          />
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.8)" }}>
            Loading your profile...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (locationGate) {
    return locationGate;
  }

  if (profileUser?.profileStage == "completed") {
    return <Welcome profileUser={profileUser} loading={loading} />;
  }

  return <CompleteProfile profileUser={profileUser} />;
}

function Welcome({ profileUser = {}, loading = false }) {
  return (
    <Box className="app">
      <Sidebar />

      <Box component="main" className="feedArea">
        <Box className="feed">
          <Filter />
          <Divider sx={{ display: { xs: "none", sm: "block" } }} />
          <PostCard loading={loading} profileUser={profileUser} />
        </Box>
      </Box>

      <MobileNav />
    </Box>
  );
}

function LocationPrompt({ loading = false, error = "", onUseLocation }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        background:
          "radial-gradient(circle at top, rgba(192, 132, 252, 0.16), transparent 35%), linear-gradient(135deg, #091214 0%, #111827 30%, #0b1220 100%)",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 470,
          bgcolor: "rgba(17, 24, 39, 0.9)",
          color: "#f9fafb",
          borderRadius: 4,
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.55)",
          overflow: "hidden",
          backdropFilter: "blur(8px)",
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2.5,
            background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 35%, #ec4899 100%)",
            color: "#fff",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <LocationOnIcon sx={{ fontSize: 28, color: "#fff" }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff" }}>
              Enable your location
            </Typography>
          </Stack>
        </Box>

        <Stack spacing={2.5} sx={{ p: 3.5, textAlign: "center", width: "100%" }}>
          <Box
            sx={{
              position: "relative",
              width: 110,
              height: 110,
              mx: "auto",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "translateZ(0)",
              "& .pulse-ring": {
                position: "absolute",
                inset: "50% auto auto 50%",
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1px solid rgba(216, 180, 254, 0.75)",
                animation: "pulseRing 2.4s ease-out infinite",
                transform: "translate(-50%, -50%)",
                transformOrigin: "center center",
                pointerEvents: "none",
              },
              "@keyframes pulseRing": {
                "0%": {
                  width: 36,
                  height: 36,
                  opacity: 0.9,
                  transform: "translate(-50%, -50%) scale(0.8)",
                },
                "70%": {
                  width: 36,
                  height: 36,
                  opacity: 0.25,
                  transform: "translate(-50%, -50%) scale(2.3)",
                },
                "100%": {
                  width: 36,
                  height: 36,
                  opacity: 0,
                  transform: "translate(-50%, -50%) scale(3.2)",
                },
              },
            }}
          >
            <Box className="pulse-ring" sx={{ opacity: 0.9 }} />
            <Box className="pulse-ring" sx={{ animationDelay: "0.8s", opacity: 0.7 }} />
            <Box
              sx={{
                position: "relative",
                width: 84,
                height: 84,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(168, 85, 247, 0.12)",
                border: "1px solid rgba(216, 180, 254, 0.35)",
                color: "#d8b4fe",
                boxShadow: "0 0 24px rgba(168, 85, 247, 0.3)",
              }}
            >
              <MyLocationIcon sx={{ fontSize: 38 }} />
            </Box>
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#f9fafb" }}>
              We need your current location
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, color: "rgba(255,255,255,0.72)" }}>
              To show relevant people nearby and improve your feed, allow access to
              your GPS location.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={loading}
            onClick={onUseLocation}
            sx={{
              py: 1.25,
              borderRadius: 2,
              fontWeight: 700,
              background: "linear-gradient(135deg, #d946ef 0%, #8b5cf6 40%, #3b82f6 100%)",
              boxShadow: "0 12px 28px rgba(139, 92, 246, 0.45)",
              color: "#fff",
              "&:hover": {
                boxShadow: "0 14px 30px rgba(168, 85, 247, 0.52)",
                background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 42%, #2563eb 100%)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              <>
                <MyLocationIcon sx={{ mr: 1, fontSize: 18 }} />
                Use my location
              </>
            )}
          </Button>

          {error ? (
            <Typography
              variant="body2"
              sx={{ color: "#fca5a5", fontWeight: 600, px: 1 }}
            >
              {error}
            </Typography>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
}

