import { Box, Divider } from "@mui/material";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
import Filter from "../components/Filter";
import PostCard from "../components/PostCard";

export default function Welcome() {
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
