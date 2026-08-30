import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Divider, Grid, Skeleton, Stack } from "@mui/material";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
import PostCard from "../components/PostCard";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { apiGet } from "../api/api";
import { useAuthStore } from "../store/authStore";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState({});
  const hasEffectRun = useRef(false);
  const userId = useAuthStore.getState().user.id;

  const editProfile = () => {
    setIsEditing(true);
  };

  const handleBack = () => {
    setIsEditing(false);
  };

  const profileUserFun = useCallback(async () => {
    try {
      setLoading(true);
      const getProfileRes = (
        await apiGet("/get/profile-details", { userId: userId })
      ).data;

      if (getProfileRes.success) {
        setProfileUser(getProfileRes.data);
      } else {
        console.error("Server Error");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!hasEffectRun.current) {
      hasEffectRun.current = true;
      profileUserFun();
    }
  }, [profileUserFun]);

  return (
    <Box className="app">
      <Sidebar />

      <Box component="main" className="feedArea">
        {loading ? (
          // <h1>Testing 1</h1>
          <Stack spacing={1}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="rectangular" width={210} height={60} />
            <Skeleton variant="rounded" width={210} height={60} />
          </Stack>
        ) : isEditing ? (
          // <h1>Testing 2</h1>

          <Box className="feed">
            <Stack
              direction="row"
              // alignItems="center"
              // justifyContent="center"
              spacing={1}
              sx={{
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                // textAlign: "center",
                mb: 1,
              }}
            >
              <div style={{ width: "33%", textAlign: "left" }}>
                <ArrowBackIcon
                  className="gradientIcon"
                  onClick={handleBack}
                  sx={{ cursor: "pointer" }}
                />
              </div>

              <div style={{ width: "33%", textAlign: "center" }}>
                <b>Edit Profile</b>
              </div>

              <div style={{ width: "34%", textAlign: "right" }}>
                {/* <div style={{float: "right"}}> */}
                <p>save</p>
                {/* </div> */}
              </div>

              <Box sx={{ width: 24 }} />
            </Stack>

            <Divider sx={{ display: { xs: "none", sm: "block" } }} />

            {/* Your Edit Profile component */}
            <Grid container spacing={2}>
              <Grid size={4}>
                <span 
                  style={{
                    cursor: "pointer",
                    display: "inline-block",
                    padding: "6px",
                    color: "#fff",
                    fontWeight: 600,s
                    transition: "all 0.3s ease",
                    border: "3px solid transparent",
                    borderImage: "linear-gradient(90deg, #0026ff 0%, #8749f4 30%, #a13ac3 55%, #ff6c5f 70%, #f13232 100%) 1",
                  }}
                >
                   sdfsdfds  
                </span>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box className="feed">
            <Stack
              direction="row"
              spacing={1}
              sx={{
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <b>Preview Profile</b>

              <EditIcon
                className="gradientIcon"
                onClick={editProfile}
                sx={{ cursor: "pointer" }}
              />
            </Stack>

            <Divider sx={{ display: { xs: "none", sm: "block" } }} />

            <PostCard loading={loading} profileUser={profileUser} />
          </Box>
        )}
      </Box>

      <MobileNav />
    </Box>
  );
}
