import { Avatar, Stack, Typography, Skeleton, Grid, Box, Divider, Input } from "@mui/material";
// import {, Grid, Icon, Skeleton, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { getAge } from "../helpers/fun";


export default function EditProfile({ loading = true, profileData = {}, handleBack = () => { } }) {
    const pictureCards = {};
    const age = profileData.dateOfBirth ? getAge(profileData.dateOfBirth) : "";
    const distance = "16 KM";

    const rand = (max = 100) => Math.floor(Math.random() * max);

    const genBlobStyle = () => {
        const c1 = `#0026ffaa`;
        const c2 = `#0026ffaa`;
        const c3 = `#a13ac3aa`;
        const c4 = `#ff6c5faa`;
        const c5 = `#f13232aa`;

        const g1 = `radial-gradient(circle at ${rand()}% ${rand()}%, ${c1} 0%, rgba(0,0,0,0) 40%)`;
        const g2 = `radial-gradient(circle at ${rand()}% ${rand()}%, ${c2} 0%, rgba(0,0,0,0) 40%)`;
        const g3 = `radial-gradient(circle at ${rand()}% ${rand()}%, ${c3} 0%, rgba(0,0,0,0) 40%)`;
        const g4 = `radial-gradient(circle at ${rand()}% ${rand()}%, ${c4} 0%, rgba(0,0,0,0) 40%)`;
        const g5 = `radial-gradient(circle at ${rand()}% ${rand()}%, ${c5} 0%, rgba(0,0,0,0) 40%)`;

        return {
            backgroundImage: [g1, g2, g3, g4, g5].join(', '),
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            color: '#fff',
            minHeight: 250,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        };
    };

    // Build cards: use provided profileData.images if present, otherwise empty slots
    const cards = [];
    const images = profileData?.images || [];
    cards.push({ src: "/post-placeholder.jpg" });
    cards.push({ src: "/post-placeholder.jpg" });

    const profileCardImgPath = ``;

    for (let i = 0; i < 7; i++) {
        cards.push({ src: images[i] || null });
    }

    return (
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

            </Stack>

            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                    {cards.map((c, idx) => (
                        <Grid item size={4} key={idx}>
                            <div className="picture-card" style={c.src ? {} : genBlobStyle()}>
                                {c.src ? (
                                    <img src={c.src} alt={`pic-${idx}`} />
                                ) : (
                                    <AddIcon sx={{ fontSize: 25, color: '#fff' }} />
                                )}
                            </div>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <Stack
                direction="column"
                alignItems="center"
                justifyContent="center"
                sx={{
                    width: "100%",
                    height: "100%",
                    textAlign: "center",
                    padding: "10px 0px 10px 0px",
                    backgroundColor: "#fff",
                    margin: "8px 0px 8px 0px",
                    borderRadius: "6px"
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
                            src={profileData?.profileImage || "https://i.pravatar.cc/100?img=68"}
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
                                {profileData?.firstName || ""} {profileData?.lastName || ""}
                            </Typography>

                            <Typography fontSize={12} color="textSecondary">
                                {profileData?.email || ""}
                            </Typography>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "end",
                                    justifyContent: "center",
                                    gap: 12,
                                }}
                            >
                                <Typography fontSize={12} color="textSecondary" >
                                    {age}
                                </Typography>
                                <Typography fontSize={12} color="textSecondary">
                                    <LocationOnIcon />  {distance}
                                </Typography>
                            </div>
                        </>
                    )}
                </Stack>
            </Stack>

            <Stack
                direction="column"
                alignItems="center"
                justifyContent="center"
                sx={{
                    width: "100%",
                    height: "100%",
                    textAlign: "center",
                    padding: "10px 0px 10px 0px",
                    backgroundColor: "#1d1e22",
                    margin: "8px 0px 8px 0px",
                    borderRadius: "6px"
                }}
                px={{ xs: 1.5, sm: 1.8 }}
                py={1.2}
            >

                <AboutEdit/>
                <InterestEdit/>
                <LifestyleEdit/>

            </Stack>
        </Box >
    )
}

function AboutEdit({ loading = false, profileUser = {} }) {
    return loading ? <></> : 
    <div style={{"padding": "10px 0px 10px 0px"}}>
        <h1>About</h1>
        <textarea className="th-input" placeholder="Expose yourself quickly...">{profileUser?.about || ""}</textarea>
    
    </div>;
}

function InterestEdit({ loading = false, profileUser = {} }) {
    return loading ? <></> : 
    <div style={{"padding": "10px 0px 10px 0px"}}>
        <h1>Interest</h1>
    </div>;
}

function LifestyleEdit({ loading = false, profileUser = {} }) {
    return loading ? <></> : 
    <div style={{"padding": "10px 0px 10px 0px"}}>
        <h1>Lifestyle</h1>
    </div>;
}