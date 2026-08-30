import { Avatar, Stack, Typography, Skeleton, Grid } from "@mui/material";

export default function PostIntro({ loading = false, profileUser = {} }) {
  const age = profileUser.dateOfBirth ? getAge(profileUser.dateOfBirth) : "";
  const distance = "16 KM";

  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        width: "100%",
        height: "100%",
        textAlign: "center",
        padding: "10px 0px 10px 0px",
      }}
      px={{ xs: 1.5, sm: 1.8 }}
      py={1.2}
    >
      <Stack
        direction="column"
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        spacing={1}
      >
        {loading ? (
          <Skeleton variant="circular" width={100} height={100} />
        ) : (
          <Avatar
            sx={{ width: 100, height: 100 }}
            src={profileUser?.profileImage || "https://i.pravatar.cc/100?img=68"}
          />
        )}
      </Stack>

      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        spacing={0.5}
      >
        {loading ? (
          <>
            <Skeleton variant="text" width={150} height={24} />
            <Skeleton variant="text" width={120} height={16} />
          </>
        ) : (
          <>
            <Typography fontWeight={900} fontSize={14}>
              {profileUser?.firstName || ""} {profileUser?.lastName || ""}
            </Typography>

            <Typography fontSize={12} color="textSecondary">
              {profileUser?.email || ""}
            </Typography>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <Typography fontSize={12} color="textSecondary">
                {age}
              </Typography>
              <Typography fontSize={12} color="textSecondary">
                {distance}
              </Typography>
            </div>
          </>
        )}
      </Stack>
    </Stack>
  );
}

function getAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}
