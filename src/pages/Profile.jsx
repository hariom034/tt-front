import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Divider, Grid, Skeleton, Stack } from "@mui/material";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
import PostCard from "../components/PostCard";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { apiGet } from "../api/api";
import { useAuthStore } from "../store/authStore";
import EditProfile from "../components/EditProfile";

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
          <EditProfile loading={loading} profileData={profileUser} handleBack={handleBack} />
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
