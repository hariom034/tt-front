import { Box, Divider } from "@mui/material";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
import Filter from "../components/Filter";
import PostCard from "../components/PostCard";
import { apiGet } from "../api/api";
import { useState, useEffect } from "react";
import CompleteProfile from "./CompleteProfile";

export default function Main() {
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  console.log("Main profileUser:", profileUser);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (profileUser?.profileStage == "completed") {
    return <Welcome />;
  }else {
    return <CompleteProfile profileUser={profileUser} />;
  }
}

function Welcome() {
  return (
    <Box className="app">
      <Sidebar />

      <Box component="main" className="feedArea">
        <Box className="feed">
          <Filter />
          <Divider sx={{ display: { xs: "none", sm: "block" } }} />
          <PostCard />
        </Box>
      </Box>

      <MobileNav />
    </Box>
  );
}

