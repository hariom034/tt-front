import React from "react";
import { Box, Badge, Stack, Typography } from "@mui/material";
import {
  FavoriteBorder,
  SettingsOutlined,
  Person,
  Message,
} from "@mui/icons-material";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useNavigate } from "react-router-dom";


export default function Sidebar() {

  const navigate = useNavigate();

  const navigateProfile = () => {
    navigate("/profile");
  };

  const navItems = [
    {
      label: "Feed",
      icon: <LocalFireDepartmentIcon />,
      onClick: () => navigate("/"),
    },
    {
      label: "Featured",
      icon: <AutoAwesomeIcon />,
      onClick: () => console.log("Featured clicked"),
    },
    {
      label: "Likes",
      icon: <FavoriteBorder />,
      onClick: () => console.log("Likes clicked"),
    },
    {
      label: "Messages",
      icon: <Badge badgeContent={2} color="error">
        <Message />
      </Badge>,
      onClick: () => console.log("Messages clicked"),
    }
  ];

  return (
    <Box component="aside" className="sidebar">
      <Box className="brand">
        {/* <Instagram sx={{ fontSize: 30 }} /> */}
        <img src="/logo.png" alt="Logo" className="brandLogo" />
        <Typography className="brandText">Velora</Typography>
      </Box>

      <Stack spacing={1.2} className="desktopNav">
        {navItems.map((item, index) => (
          <Box
            key={item.label}
            className={`navItem ${index === 0 ? "active" : ""}`}
            onClick={item.onClick}
          >
            {item.label === "Messages" ? (
              <Badge badgeContent={2} color="error">
                {item.icon}
              </Badge>
            ) : (
              item.icon
            )}
            <Typography>{item.label}</Typography>
          </Box>
        ))}
      </Stack>

      <Stack spacing={1.2} className="bottomSidebar">
        <Box className="navItem">
          <SettingsOutlined />
          <Typography>More</Typography>
        </Box>
        <Box className="navItem" onClick={navigateProfile

        }>
          <Person />
          <Typography>Profile</Typography>
        </Box>
      </Stack>
    </Box>
  );
}
