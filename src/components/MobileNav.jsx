import React from 'react';
import { Avatar, Badge, IconButton, Paper } from '@mui/material';
import {SendOutlined, FavoriteBorder } from '@mui/icons-material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function MobileNav() {
  const items = [
    <LocalFireDepartmentIcon />,
    <AutoAwesomeIcon />,
    <Badge badgeContent={2} color="error"><SendOutlined /></Badge>,
    <FavoriteBorder />,
  ];

  return (
    <Paper className="mobileNav" elevation={0}>
      {items.map((icon, index) => (
        <IconButton key={index} size="large">{icon}</IconButton>
      ))}
      <Avatar sx={{ width: 26, height: 26 }} src="https://i.pravatar.cc/100?img=8" />
    </Paper>
  );
}
