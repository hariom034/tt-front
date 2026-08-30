import { Stack, Skeleton, Grid } from "@mui/material";
import { useState } from "react";

const tabs = ["About", "Interest", "Lifestyle"];

export default function PostContent({ loading = false, profileUser = {} }) {
  const [activeTab, setActiveTab] = useState("About");

  console.log(profileUser);

  const renderTabContent = () => {
    switch (activeTab) {
      case "About":
        return <About loading={loading} profileUser={profileUser} />;
      case "Interest":
        return <Interest loading={loading} profileUser={profileUser} />;
      case "Lifestyle":
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
        alignItems="center"
        justifyContent="center"
        spacing={0.5}
        sx={{
          width: "100%",
          height: "100%",
          textAlign: "center",
          backgroundColor: "#090a0f",
          color: "white",
          padding: "20px 0px ",
          minHeight: "100vh",
        }}
      >
        <Grid container spacing={2}>
          {tabs.map((tab) => (
            <Grid size={4} key={tab}>
              <span
                onClick={() => setActiveTab(tab)}
                style={{
                  cursor: "pointer",
                  display: "inline-block",
                  paddingBottom: "6px",
                  color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.7)",
                  fontWeight: activeTab === tab ? 600 : 500,
                  transition: "all 0.3s ease",
                  borderBottom:
                    activeTab === tab
                      ? "3px solid transparent"
                      : "3px solid transparent",
                  backgroundImage:
                    activeTab === tab
                      ? "linear-gradient(90deg, #0026ff 0%, #8749f4 30%, #a13ac3 55%, #ff6c5f 70%, #f13232 100%)"
                      : "none",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: activeTab === tab ? "100% 3px" : "auto",
                  backgroundPosition: "0 100%",
                }}
              >
                {tab}
              </span>
            </Grid>
          ))}
        </Grid>

        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          spacing={0.5}
          sx={{
            textAlign: "center",
            backgroundColor: "#090a0f",
            color: "white",
            padding: "20px 0px ",
            minHeight: "100vh",
          }}
        >
          {renderTabContent()}
        </Stack>
      </Stack>
    </>
  );
}

function About({ loading = false, profileUser ={} }) {
  return loading ? <></> : <>
    <h1>About</h1>
  </>;
}

function Interest({ loading = false, profileUser ={} }) {
  return loading ? <></> : <>
    <h1>Interest</h1>
  </>;
}

function Lifestyle({ loading = false, profileUser ={} }) {
  return loading ? <></> : <>
    <h1>Lifestyle</h1>
  </>;
}
