import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
import Filter from "../components/Filter";
import PostCard from "../components/PostCard";
import { apiGet } from "../api/api";
import { useState, useEffect, useRef } from "react";
import CompleteProfile from "./CompleteProfile";

function getLocationValues(location = {}) {
  const latitude =
    location?.latitude ??
    location?.lat ??
    location?.location?.latitude ??
    location?.location?.lat ??
    location?.location?.coordinates?.latitude ??
    location?.location?.coordinates?.lat ??
    location?.coordinates?.latitude ??
    location?.coordinates?.lat;

  const longitude =
    location?.longitude ??
    location?.lng ??
    location?.location?.longitude ??
    location?.location?.lng ??
    location?.location?.coordinates?.longitude ??
    location?.location?.coordinates?.lng ??
    location?.coordinates?.longitude ??
    location?.coordinates?.lng;

  return {
    latitude,
    longitude,
  };
}

function hasUserLocation(location = {}) {
  const { latitude, longitude } = getLocationValues(location);

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

function normalizeSuggestionsPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.suggestions)) {
    return payload.suggestions;
  }

  if (Array.isArray(payload?.profiles)) {
    return payload.profiles;
  }

  if (Array.isArray(payload?.data?.suggestions)) {
    return payload.data.suggestions;
  }

  if (Array.isArray(payload?.data?.profiles)) {
    return payload.data.profiles;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
}

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

    if (!parsed?.timestamp) {
      return null;
    }

    const cachedSuggestions = normalizeSuggestionsPayload(parsed.data ?? parsed);

    if (!Array.isArray(cachedSuggestions) || cachedSuggestions.length === 0) {
      window.localStorage.removeItem(MATCH_SUGGESTIONS_CACHE_KEY);
      return null;
    }

    if (now - parsed.timestamp > MATCH_SUGGESTIONS_CACHE_TTL) {
      window.localStorage.removeItem(MATCH_SUGGESTIONS_CACHE_KEY);
      return null;
    }

    return cachedSuggestions;
  } catch (error) {
    console.error("Error reading match suggestions cache:", error);
    return null;
  }
}

function writeMatchSuggestionsCache(data) {
  if (typeof window === "undefined") {
    return;
  }

  const suggestions = normalizeSuggestionsPayload(data);

  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    return;
  }

  try {
    window.localStorage.setItem(
      MATCH_SUGGESTIONS_CACHE_KEY,
      JSON.stringify({
        data: suggestions,
        timestamp: Date.now(),
        fetchedAt: new Date().toISOString(),
      })
    );

  } catch (error) {
    console.error("Error writing match suggestions cache:", error);
  }
}

export default function Main() {
  const [profileUser, setProfileUser] = useState(null);
  const [latestLocation, setLatestLocation] = useState(null);
  const [matchSuggestions, setMatchSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const lastRequestKeyRef = useRef("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const response = await apiGet("/get/front-details");
        const profile = response?.data?.success ? response.data.data || {} : {};
        setProfileUser(profile);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfileUser({});
      }
    }

    fetchProfile();
  }, []);

  const hasAnyLocation =
    hasUserLocation(latestLocation || {}) || hasUserLocation(profileUser || {});

  useEffect(() => {
    if (!profileUser && !latestLocation) {
      return;
    }

    let isMounted = true;

    async function fetchMatchSuggestions() {
      const params = { limit: 20 };
      const currentLocation = latestLocation ?? profileUser ?? {};
      const locationExists = hasUserLocation(currentLocation);

      if (locationExists) {
        params.latitude =
          currentLocation.latitude ??
          currentLocation.location?.latitude ??
          currentLocation.coordinates?.latitude;
        params.longitude =
          currentLocation.longitude ??
          currentLocation.location?.longitude ??
          currentLocation.coordinates?.longitude;
      }

      const requestKey = JSON.stringify({
        limit: params.limit,
        latitude: params.latitude ?? null,
        longitude: params.longitude ?? null,
      });

      const cachedSuggestions = readMatchSuggestionsCache();

      if (Array.isArray(cachedSuggestions) && cachedSuggestions.length > 0) {
        if (lastRequestKeyRef.current === requestKey) {
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        lastRequestKeyRef.current = requestKey;

        if (isMounted) {
          setMatchSuggestions(cachedSuggestions);
          setLoading(false);
        }
        return;
      }

      if (lastRequestKeyRef.current === requestKey) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      lastRequestKeyRef.current = requestKey;

      try {
        const response = await apiGet("/get/match-suggestions", params);
        const suggestions = normalizeSuggestionsPayload(response?.data ?? response);

        if (isMounted) {
          setMatchSuggestions(suggestions);
          if (suggestions.length > 0) {
            writeMatchSuggestionsCache(suggestions);
          }
        }
      } catch (error) {
        console.error("Error fetching match suggestions:", error);
        if (isMounted) {
          setMatchSuggestions([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchMatchSuggestions();

    return () => {
      isMounted = false;
    };
  }, [profileUser, latestLocation]);

  useEffect(() => {
    if (hasAnyLocation || locationLoading) {
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
  }, [hasAnyLocation, locationLoading]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("This browser does not support geolocation.");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nextLatitude = coords.latitude;
        const nextLongitude = coords.longitude;

        const nextLocation = {
          latitude: nextLatitude,
          longitude: nextLongitude,
        };

        setLatestLocation(nextLocation);
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
        setLocationLoading(false);
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

  const shouldShowLocationPrompt =
    !loading && !hasAnyLocation && !locationLoading && !locationError;

  if (shouldShowLocationPrompt || locationError) {
    return (
      <LocationPrompt
        loading={locationLoading}
        error={locationError}
        onUseLocation={handleUseLocation}
      />
    );
  }

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
        <Stack spacing={2} sx={{ alignItems: "center" }}>
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

  if (profileUser?.profileStage == "completed") {
    return (
      <Welcome
        profileUser={profileUser}
        loading={loading}
        suggestions={matchSuggestions}
        onSuggestionSwipe={(nextDeck) => {
          setMatchSuggestions(nextDeck);
          if (Array.isArray(nextDeck) && nextDeck.length > 0) {
            writeMatchSuggestionsCache(nextDeck);
          } else {
            window.localStorage.removeItem(MATCH_SUGGESTIONS_CACHE_KEY);
          }
        }}
      />
    );
  }

  return <CompleteProfile profileUser={profileUser} />;
}

function Welcome({ profileUser = {}, loading = false, suggestions = [], onSuggestionSwipe }) {
  return (
    <Box className="app">
      <Sidebar />

      <Box component="main" className="feedArea">
        <Box className="feed">
          <Filter />
          <Divider sx={{ display: { xs: "none", sm: "block" } }} />
          <PostDeck suggestions={suggestions} loading={loading} onSuggestionSwipe={onSuggestionSwipe} />
        </Box>
      </Box>

      <MobileNav />
    </Box>
  );
}

function PostDeck({ suggestions = [], loading = false, onSuggestionSwipe }) {
  const [deck, setDeck] = useState(Array.isArray(suggestions) ? suggestions : []);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const pointerStart = useRef(0);
  const dragXRef = useRef(0);

  useEffect(() => {
    setDeck(Array.isArray(suggestions) ? suggestions : []);
  }, [suggestions]);

  const currentSuggestion = Array.isArray(deck) ? deck[0] : null;

  const resetDrag = () => {
    setDragging(false);
    setDragX(0);
    dragXRef.current = 0;
  };

  const handleSwipe = (direction) => {

    
    if (!currentSuggestion) {
      return;
    }
    
    console.log(direction);
    console.log(direction === "left" ? "swipe left" : "swipe right");

    const nextDeck = deck.slice(1);
    setDeck(nextDeck);
    onSuggestionSwipe?.(nextDeck);
    resetDrag();
  };

  const handlePointerDown = (event) => {
    if (!currentSuggestion) {
      return;
    }

    event.preventDefault();
    setDragging(true);
    pointerStart.current = event.clientX;
    dragXRef.current = 0;
    setDragX(0);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!currentSuggestion || !dragging) {
      return;
    }

    const delta = event.clientX - pointerStart.current;
    const nextDragX = Math.max(-200, Math.min(200, delta));
    dragXRef.current = nextDragX;
    setDragX(nextDragX);
  };

  const handlePointerUp = () => {
    if (!currentSuggestion || !dragging) {
      return;
    }

    const currentDragX = dragXRef.current;

    if (currentDragX > 100) {
      handleSwipe("right");
      return;
    }

    if (currentDragX < -100) {
      handleSwipe("left");
      return;
    }

    resetDrag();
  };

  if (!currentSuggestion) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 420,
          borderRadius: 4,
          background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.10))",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#fff",
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        No profiles available.
      </Box>
    );
  }

  const rotation = dragX / 18;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: 520,
        mx: "auto",
        minHeight: 620,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        userSelect: "none",
      }}
    >
      <Box
        sx={{
          position: "relative",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Box
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          sx={{
            position: "relative",
            width: "100%",
            transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
            transition: dragging ? "none" : "transform 0.2s ease",
            touchAction: "pan-y",
            willChange: "transform",
          }}
        >
          <PostCard loading={loading} profileUser={currentSuggestion} />
        </Box>

        {dragX > 70 && (
          <Box
            sx={{
              position: "absolute",
              top: 24,
              left: 28,
              px: 1.25,
              py: 0.4,
              borderRadius: 999,
              border: "2px solid #22c55e",
              color: "#22c55e",
              fontWeight: 800,
              letterSpacing: 1,
              background: "rgba(34,197,94,0.12)",
              transform: "rotate(-18deg)",
            }}
          >
            LIKE
          </Box>
        )}

        {dragX < -70 && (
          <Box
            sx={{
              position: "absolute",
              top: 24,
              right: 28,
              px: 1.25,
              py: 0.4,
              borderRadius: 999,
              border: "2px solid #ef4444",
              color: "#ef4444",
              fontWeight: 800,
              letterSpacing: 1,
              background: "rgba(239,68,68,0.12)",
              transform: "rotate(18deg)",
            }}
          >
            PASS
          </Box>
        )}
      </Box>

      <Stack
        direction="row"
        spacing={2}
        sx={{
          position: "sticky",
          bottom: 0,
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          pb: 1.5,
          pt: 1,
          zIndex: 2,
          background: "linear-gradient(180deg, rgba(9, 16, 22, 0) 0%, rgba(9, 16, 22, 0.9) 25%, rgba(9, 16, 22, 1) 100%)",
        }}
      >
        <IconButton
          aria-label="pass"
          onClick={() => handleSwipe("left")}
          sx={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))",
            color: "#f87171",
            border: "1px solid rgba(248,113,113,0.5)",
            boxShadow: "0 12px 28px rgba(248, 113, 113, 0.22)",
            transition: "all 0.22s ease",
            transform: "translateY(0)",
            animation: "passPulse 1.8s ease-in-out infinite",
            "&:hover": {
              transform: "translateY(-2px) scale(1.04)",
              background: "linear-gradient(135deg, rgba(248,113,113,0.18), rgba(127,29,29,0.18))",
            },
            "@keyframes passPulse": {
              "0%, 100%": { boxShadow: "0 10px 24px rgba(248, 113, 113, 0.18)" },
              "50%": { boxShadow: "0 14px 30px rgba(248, 113, 113, 0.38)" },
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 34 }} />
        </IconButton>

        <IconButton
          aria-label="like"
          onClick={() => handleSwipe("right")}
          sx={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(34,197,94,0.26), rgba(16,185,129,0.14))",
            color: "#4ade80",
            border: "1px solid rgba(74,222,128,0.55)",
            boxShadow: "0 12px 28px rgba(34, 197, 94, 0.22)",
            transition: "all 0.22s ease",
            transform: "translateY(0)",
            animation: "likePulse 1.8s ease-in-out infinite",
            "&:hover": {
              transform: "translateY(-2px) scale(1.04)",
              background: "linear-gradient(135deg, rgba(34,197,94,0.32), rgba(16,185,129,0.22))",
            },
            "@keyframes likePulse": {
              "0%, 100%": { boxShadow: "0 10px 24px rgba(34, 197, 94, 0.18)" },
              "50%": { boxShadow: "0 14px 30px rgba(34, 197, 94, 0.38)" },
            },
          }}
        >
          <FavoriteIcon sx={{ fontSize: 32 }} />
        </IconButton>
      </Stack>
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
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
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

