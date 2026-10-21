import { Stack, Skeleton, Grid, Chip, Box, Typography } from "@mui/material";
import {
  AccountCircleOutlined,
  CalendarTodayOutlined,
  FavoriteBorderOutlined,
  HeightOutlined,
  LocationOnOutlined,
  PersonOutlineOutlined,
  PublicOutlined,
  SchoolOutlined,
  WorkOutlineOutlined,
  WcOutlined,
} from "@mui/icons-material";
import { useState } from "react";

const tabs = [
  { label: "About", page: "about" },
  { label: "Interest", page: "interest" },
  { label: "Lifestyle", page: "lifestyle" },
];

export default function PostContent({ loading = false, profileUser = {} }) {
  const [activeTab, setActiveTab] = useState("about");

  const renderTabContent = (activePage) => {
    switch (activePage) {
      case "about":
        return <About loading={loading} profileUser={profileUser} />;
      case "interest":
        return <Interest loading={loading} profileUser={profileUser} />;
      case "lifestyle":
        return <Lifestyle loading={loading} profileUser={profileUser} />;
      default:
        return null;
    }
  };

  return loading ? (
    <>
      <Skeleton variant="text" width={150} height={24} />
      <Skeleton variant="text" width={120} height={16} />
    </>
  ) : (
    <>
      <Stack
        direction="column"
        spacing={0.5}
        sx={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          backgroundColor: "#090a0f",
          color: "white",
          padding: "20px 0px ",
        }}
      >
        <Grid container spacing={2}>
          {tabs.map((tab) => (
            <Grid size={4} key={tab.page}>
              <span
                onClick={() => setActiveTab(tab.page)}
                style={{
                  cursor: "pointer",
                  display: "inline-block",
                  paddingBottom: "6px",
                  color: activeTab === tab.page ? "#fff" : "rgba(255,255,255,0.7)",
                  fontWeight: activeTab === tab.page ? 600 : 500,
                  transition: "all 0.3s ease",
                  borderBottom:
                    activeTab === tab.page
                      ? "3px solid transparent"
                      : "3px solid transparent",
                  backgroundImage:
                    activeTab === tab.page
                      ? "linear-gradient(90deg, #0026ff 0%, #8749f4 30%, #a13ac3 55%, #ff6c5f 70%, #f13232 100%)"
                      : "none",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: activeTab === tab.page ? "100% 3px" : "auto",
                  backgroundPosition: "0 100%",
                }}
              >
                {tab.label}
              </span>
            </Grid>
          ))}
        </Grid>

        <Stack
          direction="column"
          spacing={0.5}
          sx={{
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#090a0f",
            color: "white",
            width: "100%",
            padding: "20px 0px ",
          }}
        >
          {renderTabContent(activeTab)}
        </Stack>
      </Stack>
    </>
  );
}

function About({ loading = false, profileUser = {} }) {
  const userAbout = profileUser?.userAbout || profileUser?.about || {};
  const career = profileUser?.career || {};

  const profileFields = [
    { label: "Religion", value: userAbout?.religion },
    { label: "Marital status", value: userAbout?.maritalStatus },
    { label: "Occupation", value: userAbout?.occupation },
    { label: "Education", value: userAbout?.education || career?.education },
    { label: "City", value: userAbout?.city },
    { label: "State", value: userAbout?.state },
    { label: "Country", value: userAbout?.country },
    { label: "Height", value: userAbout?.height },
    { label: "Looking for", value: userAbout?.lookingFor },
    { label: "Min age preference", value: userAbout?.minAgePreference },
    { label: "Max age preference", value: userAbout?.maxAgePreference },
  ];

  const careerFields = [
    { label: "Education institute", value: career?.educationInstitute },
    { label: "Job", value: career?.job },
    { label: "Company", value: career?.company },
    { label: "Achivemnt Title", value: career?.toBecome },
  ];

  const renderValue = (value) => {
    if (value === null || value === undefined || value === "") return "Not added";
    return value;
  };

  const fieldIcons = {
    Religion: FavoriteBorderOutlined,
    "Marital status": WcOutlined,
    Occupation: WorkOutlineOutlined,
    Education: SchoolOutlined,
    City: LocationOnOutlined,
    State: LocationOnOutlined,
    Country: PublicOutlined,
    Height: HeightOutlined,
    "Looking for": FavoriteBorderOutlined,
    "Min age preference": CalendarTodayOutlined,
    "Max age preference": CalendarTodayOutlined,
    "Education institute": SchoolOutlined,
    Job: WorkOutlineOutlined,
    Company: AccountCircleOutlined,
    "Target role": PersonOutlineOutlined,
  };

  if (loading) return <></>;

  return (
    <Box sx={{ width: "100%", maxWidth: 760, px: 1, py: 0.5 }}>
      <Stack spacing={2.5} sx={{ width: "100%", textAlign: "left" }}>
        {userAbout?.bio ? (
          <Box sx={{ textAlign: "left" }}>
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", mb: 0.75 }}>
              Bio
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.88)", lineHeight: 1.8, fontSize: 14, textAlign: "left" }}>
              {userAbout.bio}
            </Typography>
          </Box>
        ) : null}

        <Box sx={{ textAlign: "left" }}>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13, letterSpacing: 1, textTransform: "uppercase", mb: 1 , fontWeight: "bold" }}>
            Profile details
          </Typography>

          <Stack spacing={0.7} sx={{ textAlign: "left" }}>
            {profileFields
              .filter((field) => field.value !== null && field.value !== undefined && field.value !== "")
              .map((field) => (
                <Box
                  key={field.label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 1.25,
                    py: 0.7,
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    textAlign: "left",
                  }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(255,255,255,0.04)",
                      color: "rgba(255,255,255,0.75)",
                    }}
                  >
                    {(() => {
                      const Icon = fieldIcons[field.label] || PersonOutlineOutlined;
                      return <Icon sx={{ fontSize: 14 }} />;
                    })()}
                  </Box>
                  <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: 11, minWidth: 110, letterSpacing: 0.3 }}>
                    {field.label}
                  </Typography>
                  <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 500, lineHeight: 1.5, textAlign: "left" }}>
                    {renderValue(field.value)}
                  </Typography>
                </Box>
              ))}
          </Stack>

          {profileFields.filter((field) => field.value !== null && field.value !== undefined && field.value !== "").length === 0 ? (
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 14, mt: 1, textAlign: "left" }}>No profile details added yet.</Typography>
          ) : null}
        </Box>

        <Box sx={{ textAlign: "left" }}>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13, letterSpacing: 1, textTransform: "uppercase", mb: 1, fontWeight: "bold" }}>
            Career
          </Typography>

          <Stack spacing={0.7} sx={{ textAlign: "left" }}>
            {careerFields
              .filter((field) => field.value !== null && field.value !== undefined && field.value !== "")
              .map((field) => (
                <Box
                  key={field.label}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 1.25,
                    py: 0.7,
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    textAlign: "left",
                  }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(255,255,255,0.04)",
                      color: "rgba(255,255,255,0.75)",
                    }}
                  >
                    {(() => {
                      const Icon = fieldIcons[field.label] || PersonOutlineOutlined;
                      return <Icon sx={{ fontSize: 14 }} />;
                    })()}
                  </Box>
                  <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: 11, minWidth: 110, letterSpacing: 0.3 }}>
                    {field.label}
                  </Typography>
                  <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 500, lineHeight: 1.5, textAlign: "left" }}>
                    {renderValue(field.value)}
                  </Typography>
                </Box>
              ))}
          </Stack>

          {careerFields.filter((field) => field.value !== null && field.value !== undefined && field.value !== "").length === 0 ? (
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 14, mt: 1, textAlign: "left" }}>No career details added yet.</Typography>
          ) : null}
        </Box>
      </Stack>
    </Box>
  );
}

function Interest({ loading = false, profileUser = {} }) {
  const interests = Array.isArray(profileUser?.interest) ? profileUser.interest : [];

  if (loading) return <></>;

  return (
    <Box sx={{ width: "100%", maxWidth: 760, px: 2, py: 3 }}>
      <Stack spacing={3} sx={{ width: "100%", alignItems: "flex-start" }}>
        {interests.length ? (
          interests.map((group, groupIndex) => {
            const values = Array.isArray(group?.values) ? group.values : [];

            return (
              <Box key={`${group?.interestId ?? groupIndex}`} sx={{ width: "100%", textAlign: "left" }}>
                <Typography
                  sx={{
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    mb: 1.5,
                  }}
                >
                  {group?.interestName || "Interest"}
                </Typography>

                <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
                  {values.length ? (
                    values.map((item, itemIndex) => (
                      <Chip
                        key={`${group?.interestId ?? groupIndex}-${item?.id ?? itemIndex}`}
                        label={item?.value || "Unknown"}
                        size="small"
                        sx={{
                          background: "linear-gradient(135deg, #546efd 0%, #a377f0 35%, #f48fb1 100%)",
                          color: "#fff",
                          fontWeight: 600,
                          borderRadius: 999,
                          height: 26,
                          ".MuiChip-label": { px: 1.1, fontSize: 12 },
                        }}
                      />
                    ))
                  ) : (
                    <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                      No values available
                    </Typography>
                  )}
                </Stack>
              </Box>
            );
          })
        ) : (
          <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>No interest data available.</Typography>
        )}
      </Stack>
    </Box>
  );
}

function Lifestyle({ loading = false, profileUser = {} }) {
  const lifestyleGroups = Array.isArray(profileUser?.lifestyle) ? profileUser.lifestyle : [];

  if (loading) return <></>;

  return (
    <Box sx={{ width: "100%", maxWidth: 760, px: 2, py: 3 }}>
      <Stack spacing={3} sx={{ width: "100%", alignItems: "flex-start" }}>
        {lifestyleGroups.length ? (
          lifestyleGroups.map((group, groupIndex) => {
            const values = Array.isArray(group?.values) ? group.values : [];

            return (
              <Box key={`${group?.lifestyleId ?? group?.id ?? groupIndex}`} sx={{ width: "100%", textAlign: "left" }}>
                <Typography
                  sx={{
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    mb: 1.5,
                  }}
                >
                  {group?.lifestyleName || group?.name || "Lifestyle"}
                </Typography>

                <Stack direction="row" flexWrap="wrap" useFlexGap gap={1}>
                  {values.length ? (
                    values.map((item, itemIndex) => (
                      <Chip
                        key={`${group?.lifestyleId ?? group?.id ?? groupIndex}-${item?.id ?? itemIndex}`}
                        label={item?.value || item?.label || "Unknown"}
                        size="small"
                        sx={{
                          background: "linear-gradient(135deg, #546efd 0%, #a377f0 35%, #f48fb1 100%)",
                          color: "#fff",
                          fontWeight: 600,
                          borderRadius: 999,
                          height: 26,
                          ".MuiChip-label": { px: 1.1, fontSize: 12 },
                        }}
                      />
                    ))
                  ) : (
                    <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                      No values available
                    </Typography>
                  )}
                </Stack>
              </Box>
            );
          })
        ) : (
          <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>No lifestyle data available.</Typography>
        )}
      </Stack>
    </Box>
  );
}
