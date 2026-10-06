import { useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    Stack,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Chip,
    IconButton,
} from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import CloseIcon from "@mui/icons-material/Close";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import { inputStyle } from "../helpers/styleHelper";
import { apiGet, apiPost } from "../api/api";
import { useAuthStore } from "../store/authStore";

function CompleteProfile({ profileUser }) {
    const stage = profileUser?.profileStage;

    return (
        <div className="user-profile-journey">
            <Box
                sx={{
                    minHeight: "calc(100vh - 100px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: { xs: 2, md: 4 },
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: 760,
                        p: { xs: 3, md: 5 },
                        borderRadius: 4,
                        background: "rgba(10, 20, 28, 0.38)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        boxShadow: "0 24px 70px rgba(14, 18, 31, 0.45)",
                    }}
                >
                    {stage === "primary" ? (
                        <Primary profileUser={profileUser} />
                    ) : stage === "gender" ? (
                        <Gender profileUser={profileUser} />
                    ) : stage === "about" ? (
                        <About profileUser={profileUser} />
                    ) : stage === "personal" ? (
                        <Personal profileUser={profileUser} />
                    ) : stage === "media" ? (
                        <Media profileUser={profileUser} />
                    ) : stage === "career" ? (
                        <Career profileUser={profileUser} />
                    ) : stage === "lifestyle" ? (
                        <Lifestyle />
                    ) : (
                        <Typography sx={{ color: "#fff" }}>Profile completion stage: {stage}</Typography>
                    )}
                </Box>
            </Box>
        </div>
    );
}

function Primary({ profileUser }) {
    const currentUser = useAuthStore((state) => state.user);
    const [formData, setFormData] = useState({
        firstName: profileUser?.firstName || "",
        lastName: profileUser?.lastName || "",
        dateOfBirth: profileUser?.dateOfBirth ? profileUser.dateOfBirth.split("T")[0] : "",
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(profileUser?.avatarUrl || "");
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const minAllowedDob = new Date();
    minAllowedDob.setFullYear(minAllowedDob.getFullYear() - 18);
    const minDobValue = minAllowedDob.toISOString().split("T")[0];

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        setAvatarFile(file);

        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.dateOfBirth) {
            setErrorMessage("Please select your date of birth.");
            return;
        }

        const selectedDate = new Date(formData.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - selectedDate.getFullYear();
        const monthDiff = today.getMonth() - selectedDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
            age -= 1;
        }

        if (age < 18) {
            setErrorMessage("You must be at least 18 years old to continue.");
            return;
        }

        setSubmitting(true);
        setErrorMessage("");

        try {
            let response;

            if (avatarFile) {
                const form = new FormData();
                form.append("userId", currentUser?.id || profileUser?.userId || profileUser?._id);
                form.append("firstName", formData.firstName);
                form.append("lastName", formData.lastName);
                form.append("dateOfBirth", formData.dateOfBirth);
                form.append("avatar", avatarFile);

                response = await apiPost("/send/primary-details", form);
            } else {
                const payload = {
                    userId: currentUser?.id || profileUser?.userId || profileUser?._id,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    dateOfBirth: formData.dateOfBirth,
                };

                response = await apiPost("/send/primary-details", payload);
            }

            if (response?.data?.success) {
                window.location.reload();
                return;
            }

            setErrorMessage(response?.data?.message || "Unable to save profile right now.");
        } catch (error) {
            setErrorMessage(
                error?.response?.data?.message || "Something went wrong while saving your profile."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <Typography
                variant="h3"
                sx={{
                    mb: 1,
                    fontWeight: 800,
                    display: "inline-block",
                    background: "linear-gradient(135deg, #f9c6ff 0%, #a5f3fc 28%, #c4b5fd 55%, #f9a8d4 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    paddingBottom: 1.5,
                    borderBottom: "3px solid transparent",
                    borderImage:
                        "linear-gradient(135deg, transparent 1%, #546efd 10%, #a377f0 30%, #be7fd3 55%, #df8880 70%, #ff7070 90%, transparent 100%) 1",
                    borderImageSlice: 1,
                }}
            >
                Enter Primary Details
            </Typography>

            <Typography sx={{ mb: 3, color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
                Tell us a little about yourself so we can personalize your experience and help you get started.
            </Typography>

            <Stack spacing={2.5} sx={{ width: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ width: 96, height: 96, borderRadius: "50%", overflow: "hidden", bgcolor: "rgba(255,255,255,0.04)" }}>
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="avatar preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <Typography sx={{ color: "rgba(255,255,255,0.6)", p: 2 }}>No photo</Typography>
                        )}
                    </Box>

                    <Button variant="outlined" component="label" sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}>
                        Upload Avatar
                        <input hidden accept="image/*" type="file" onChange={handleFileChange} />
                    </Button>
                </Box>
                <TextField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    required
                    sx={inputStyle}
                />

                <TextField
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    required
                    sx={inputStyle}
                />

                <TextField
                    label="Date of Birth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    required
                    sx={inputStyle}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ max: minDobValue }}
                />
            </Stack>

            {errorMessage ? (
                <Typography sx={{ mt: 2, color: "#ffb4b4" }}>{errorMessage}</Typography>
            ) : null}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    sx={{
                        px: 4,
                        py: 1.2,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #546efd 0%, #a377f0 35%, #f48fb1 100%)",
                        boxShadow: "0 16px 28px rgba(99, 102, 241, 0.35)",
                        fontWeight: 700,
                        textTransform: "none",
                        "&:hover": {
                            background: "linear-gradient(135deg, #5c73ff 0%, #9a74f5 35%, #f59ec3 100%)",
                        },
                    }}
                >
                    {submitting ? "Saving..." : "Save Profile"}
                </Button>
            </Box>
        </Box>
    );
}

function Gender({ profileUser }) {
    const currentUser = useAuthStore((state) => state.user);
    const [formData, setFormData] = useState({
        sexualOrientation: profileUser?.sexualOrientation || "",
        otherSexualOrientation: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const mainOptions = [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
    ];

    const otherOptions = [
        { label: "Gay", value: "gay" },
        { label: "Lesbian", value: "lesbian" },
        { label: "Bisexual", value: "bisexual" },
        { label: "Pansexual", value: "pansexual" },
        { label: "Asexual", value: "asexual" },
        { label: "Not Sure", value: "not-sure" },
    ];

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const selectedSexualOrientation = formData.sexualOrientation === "other" ? formData.otherSexualOrientation : formData.sexualOrientation;

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.sexualOrientation) {
            setErrorMessage("Please select your sexual orientation.");
            return;
        }

        setSubmitting(true);
        setErrorMessage("");

        try {
            const payload = {
                page: "sexual-orientation",
                sexualOrientation: selectedSexualOrientation,
            };

            const response = await apiPost("/send/user-details", payload);

            if (response?.data?.success) {
                window.location.reload();
                return;
            }

            setErrorMessage(response?.data?.message || "Unable to save your selection right now.");
        } catch (error) {
            setErrorMessage(
                error?.response?.data?.message || "Something went wrong while saving your selection."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <Typography
                variant="h3"
                sx={{
                    mb: 1,
                    fontWeight: 800,
                    display: "inline-block",
                    background: "linear-gradient(135deg, #f9c6ff 0%, #a5f3fc 28%, #c4b5fd 55%, #f9a8d4 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    paddingBottom: 1.5,
                    borderBottom: "3px solid transparent",
                    borderImage:
                        "linear-gradient(135deg, transparent 1%, #546efd 10%, #a377f0 30%, #be7fd3 55%, #df8880 70%, #ff7070 90%, transparent 100%) 1",
                    borderImageSlice: 1,
                }}
            >
                Sexual Orientation
            </Typography>
            <Typography sx={{ mb: 3, color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
                Help us understand you better by selecting the option that best matches your identity.
            </Typography>

            <Stack spacing={2.5} sx={{ width: "100%" }}>
                <FormControl component="fieldset" sx={{ width: "100%" }}>
                    <RadioGroup
                        name="sexualOrientation"
                        value={formData.sexualOrientation}
                        onChange={handleChange}
                    >
                        <Stack spacing={1.25}>
                            {mainOptions.map((option) => (
                                <FormControlLabel
                                    key={option.value}
                                    value={option.value}
                                    control={<Radio sx={{ color: "rgba(255,255,255,0.8)", '&.Mui-checked': { color: "#ffffff" } }} />}
                                    label={
                                        <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>{option.label}</Typography>
                                    }
                                    sx={{ marginLeft: 0, marginRight: 0 }}
                                />
                            ))}
                        </Stack>
                    </RadioGroup>

                    <Typography sx={{ color: "rgba(255,255,255,0.9)", mb: 1.5, pl: 1.5, fontWeight: 600, mt: 2, borderLeft: "1px solid rgba(255,255,255,0.25)" }}>
                        Other
                    </Typography>

                    <RadioGroup
                        name="sexualOrientation"
                        value={formData.sexualOrientation}
                        onChange={handleChange}
                    >
                        <Stack spacing={1.25}>
                            {otherOptions.map((option) => (
                                <FormControlLabel
                                    key={option.value}
                                    value={option.value}
                                    control={<Radio sx={{ color: "rgba(255,255,255,0.8)", '&.Mui-checked': { color: "#ffffff" } }} />}
                                    label={<Typography sx={{ color: "rgba(255,255,255,0.9)" }}>{option.label}</Typography>}
                                    sx={{ marginLeft: 0, marginRight: 0 }}
                                />
                            ))}
                        </Stack>
                    </RadioGroup>
                </FormControl>
            </Stack>

            {errorMessage ? (
                <Typography sx={{ mt: 2, color: "#ffb4b4" }}>{errorMessage}</Typography>
            ) : null}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    sx={{
                        px: 4,
                        py: 1.2,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #546efd 0%, #a377f0 35%, #f48fb1 100%)",
                        boxShadow: "0 16px 28px rgba(99, 102, 241, 0.35)",
                        fontWeight: 700,
                        textTransform: "none",
                        "&:hover": {
                            background: "linear-gradient(135deg, #5c73ff 0%, #9a74f5 35%, #f59ec3 100%)",
                        },
                    }}
                >
                    {submitting ? "Saving..." : "Save Profile"}
                </Button>
            </Box>
        </Box>
    );
}

function About({ profileUser }) {
    const currentUser = useAuthStore((state) => state.user);
    const [formData, setFormData] = useState({
        aboutYou: profileUser?.aboutYou || "",
        personality: profileUser?.personality || ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const personalities = [
        "INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP",
        "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"
    ];

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleChipSelect = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.aboutYou.trim()) {
            setErrorMessage("Please provide some information about yourself.");
            return;
        }

        setSubmitting(true);
        setErrorMessage("");

        try {
            const payload = {
                page: "about",
                bio: formData.aboutYou.trim(),
                personality: formData.personality
            };

            const response = await apiPost("/send/user-details", payload);

            if (response?.data?.success) {
                window.location.reload();
                return;
            }

            setErrorMessage(response?.data?.message || "Unable to save your information right now.");
        } catch (error) {
            setErrorMessage(
                error?.response?.data?.message || "Something went wrong while saving your information."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <Typography
                variant="h3"
                sx={{
                    mb: 1,
                    fontWeight: 800,
                    display: "inline-block",
                    background: "linear-gradient(135deg, #f9c6ff 0%, #a5f3fc 28%, #c4b5fd 55%, #f9a8d4 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    paddingBottom: 1.5,
                    borderBottom: "3px solid transparent",
                    borderImage:
                        "linear-gradient(135deg, transparent 1%, #546efd 10%, #a377f0 30%, #be7fd3 55%, #df8880 70%, #ff7070 90%, transparent 100%) 1",
                    borderImageSlice: 1,
                }}
            >
                About You
            </Typography>

            <Typography sx={{ mb: 3, color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
                Share a brief description about yourself to help others get to know you better.
            </Typography>

            <Stack spacing={2.5} sx={{ width: "100%" }}>
                <TextField
                    label="About You"
                    name="aboutYou"
                    value={formData.aboutYou}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    required
                    multiline
                    rows={4}
                    sx={inputStyle}
                />

                <div className="">
                    <Typography sx={{ fontSize: 16, color: "#fff", paddingTop: 3 }}>How do you describe your personality?</Typography>
                </div>
                <div className="">

                    {personalities.map((personality) => {
                        const selected = formData.personality === personality;
                        return (
                            <Chip
                                key={personality}
                                label={personality}
                                onClick={() => handleChipSelect("personality", personality)}
                                clickable
                                sx={{
                                    marginRight: 1,
                                    marginBottom: 1,
                                    cursor: "pointer",
                                    background: selected ? "linear-gradient(135deg, #546efd 0%, #a377f0 50%, #f48fb1 100%)" : "rgba(255, 255, 255, 0)",
                                    color: selected ? "#fff" : "rgba(255,255,255,0.75)",
                                    border: selected ? "1px solid transparent" : "1px solid rgba(255,255,255,0.25)",
                                    boxShadow: selected ? "0 8px 30px rgba(83,63,255,0.14)" : "none",
                                    cursor: "pointer"
                                }}
                            />
                        );
                    })}
                </div>

            </Stack>

            {errorMessage ? (
                <Typography sx={{ mt: 2, color: "#ffb4b4" }}>{errorMessage}</Typography>
            ) : null}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    sx={{
                        px: 4,
                        py: 1.2,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #546efd 0%, #a377f0 35%, #f48fb1 100%)",
                        boxShadow: "0 16px 28px rgba(99, 102, 241, 0.35)",
                        fontWeight: 700,
                        textTransform: "none",
                        cursor: "pointer",
                        "&:hover": {
                            background: "linear-gradient(135deg, #5c73ff 0%, #9a74f5 35%, #f59ec3 100%)",
                        },
                    }}
                >
                    {submitting ? "Saving..." : "Save Profile"}
                </Button>
            </Box>
        </Box>
    );
}

function Personal({ profileUser }) {
    const currentUser = useAuthStore((state) => state.user);
    const [formData, setFormData] = useState({
        maritalStatus: profileUser?.maritalStatus || "",
        religion: profileUser?.religion || "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [formPuts, setFormPuts] = useState({
        maritalStatuses: [],
        religions: [],
    });

    useEffect(() => {
        const fetchFormOptions = async () => {
            try {
                const response = await apiGet("/get/user-form", { page: "personal" });

                if (response?.data?.success) {
                    setFormPuts(response.data.data || {});
                }
            } catch (error) {
                setErrorMessage(
                    error?.response?.data?.message || "Unable to load form options right now."
                );
            }
        };

        fetchFormOptions();
    }, []);

    const maritalStatuses = Array.isArray(formPuts.maritalStatuses)
        ? formPuts.maritalStatuses
        : [];
    const religions = Array.isArray(formPuts.religions) ? formPuts.religions : [];


    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleChipSelect = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.religion || !formData.maritalStatus) {
            setErrorMessage("Please select your religion and marital status.");
            return;
        }

        setSubmitting(true);
        setErrorMessage("");

        try {
            const payload = {
                page: "personal",
                maritalStatus: formData.maritalStatus,
                religion: formData.religion,
            };

            const response = await apiPost("/send/user-details", payload);

            if (response?.data?.success) {
                window.location.reload();
                return;
            }

            setErrorMessage(response?.data?.message || "Unable to save your information right now.");
        } catch (error) {
            setErrorMessage(
                error?.response?.data?.message || "Something went wrong while saving your information."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <Typography
                variant="h3"
                sx={{
                    mb: 1,
                    fontWeight: 800,
                    display: "inline-block",
                    background: "linear-gradient(135deg, #f9c6ff 0%, #a5f3fc 28%, #c4b5fd 55%, #f9a8d4 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    paddingBottom: 1.5,
                    borderBottom: "3px solid transparent",
                    borderImage:
                        "linear-gradient(135deg, transparent 1%, #546efd 10%, #a377f0 30%, #be7fd3 55%, #df8880 70%, #ff7070 90%, transparent 100%) 1",
                    borderImageSlice: 1,
                }}
            >
                Some Personal
            </Typography>

            <Typography sx={{ mb: 3, color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
                Expose some personal.
            </Typography>

            <Stack spacing={2.5} sx={{ width: "100%" }}>
                <div className="">
                    <Typography sx={{ fontSize: 16, color: "#fff", paddingTop: 3 }}>What is your religion?</Typography>
                </div>
                <div className="">
                    {religions.map((religion) => {
                        const selected = formData.religion === religion.value;
                        return (
                            <Chip
                                key={religion.value}
                                label={religion.label}
                                onClick={() => handleChipSelect("religion", religion.value)}
                                clickable
                                sx={{
                                    marginRight: 1,
                                    marginBottom: 1,
                                    cursor: "pointer",
                                    background: selected ? "linear-gradient(135deg, #546efd 0%, #a377f0 50%, #f48fb1 100%)" : "rgba(255, 255, 255, 0)",
                                    color: selected ? "#fff" : "rgba(255,255,255,0.75)",
                                    border: selected ? "1px solid transparent" : "1px solid rgba(255,255,255,0.25)",
                                    boxShadow: selected ? "0 8px 30px rgba(83,63,255,0.14)" : "none",
                                }}
                            />
                        );
                    })}
                </div>

                <div className="">
                    <Typography sx={{ fontSize: 16, color: "#fff", paddingTop: 3 }}>What is your marital status?</Typography>
                </div>
                <div className="">
                    {maritalStatuses.map((status) => {
                        const selected = formData.maritalStatus === status;
                        return (
                            <Chip
                                key={status}
                                label={status.charAt(0).toUpperCase() + status.slice(1)}
                                onClick={() => handleChipSelect("maritalStatus", status)}
                                clickable
                                sx={{
                                    marginRight: 1,
                                    marginBottom: 1,
                                    cursor: "pointer",
                                    background: selected ? "linear-gradient(135deg, #546efd 0%, #a377f0 50%, #f48fb1 100%)" : "rgba(255, 255, 255, 0)",
                                    color: selected ? "#fff" : "rgba(255,255,255,0.75)",
                                    border: selected ? "1px solid transparent" : "1px solid rgba(255,255,255,0.25)",
                                    boxShadow: selected ? "0 8px 30px rgba(83,63,255,0.14)" : "none",
                                }}
                            />
                        );
                    })}
                </div>

            </Stack>

            {errorMessage ? (
                <Typography sx={{ mt: 2, color: "#ffb4b4" }}>{errorMessage}</Typography>
            ) : null}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    sx={{
                        px: 4,
                        py: 1.2,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #546efd 0%, #a377f0 35%, #f48fb1 100%)",
                        boxShadow: "0 16px 28px rgba(99, 102, 241, 0.35)",
                        fontWeight: 700,
                        textTransform: "none",
                        "&:hover": {
                            background: "linear-gradient(135deg, #5c73ff 0%, #9a74f5 35%, #f59ec3 100%)",
                        },
                    }}
                >
                    {submitting ? "Saving..." : "Save Profile"}
                </Button>
            </Box>
        </Box>
    );
}

function Career({ profileUser }) {
    const [formData, setFormData] = useState({
        education: profileUser?.education || "",
        educationInstitute: profileUser?.educationInstitute || "",
        job: profileUser?.job || "",
        company: profileUser?.company || "",
        toBecome: profileUser?.toBecome || "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [formPuts, setFormPuts] = useState({
        educations: [],
    });

    useEffect(() => {
        const fetchFormOptions = async () => {
            try {
                const response = await apiGet("/get/user-form", { page: "career" });

                if (response?.data?.success) {
                    setFormPuts(response.data.data || {});
                }
            } catch (error) {
                setErrorMessage(
                    error?.response?.data?.message || "Unable to load form options right now."
                );
            }
        };

        fetchFormOptions();
    }, []);

    const educations = Array.isArray(formPuts.educations)
        ? formPuts.educations.map((education) => ({
            ...education,
            label: education.label ?? education.lable ?? "",
        }))
        : [];

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleChipSelect = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.education) {
            setErrorMessage("Please select your education level.");
            return;
        }

        setSubmitting(true);
        setErrorMessage("");

        try {
            const payload = {
                page: "career",
                education: formData.education,
                educationInstitute: formData.educationInstitute,
                job: formData.job,
                company: formData.company,
                toBecome: formData.toBecome,
            };

            const response = await apiPost("/send/user-details", payload);

            if (response?.data?.success) {
                window.location.reload();
                return;
            }

            setErrorMessage(response?.data?.message || "Unable to save your information right now.");
        } catch (error) {
            setErrorMessage(
                error?.response?.data?.message || "Something went wrong while saving your information."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <Typography
                variant="h3"
                sx={{
                    mb: 1,
                    fontWeight: 800,
                    display: "inline-block",
                    background: "linear-gradient(135deg, #f9c6ff 0%, #a5f3fc 28%, #c4b5fd 55%, #f9a8d4 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    paddingBottom: 1.5,
                    borderBottom: "3px solid transparent",
                    borderImage:
                        "linear-gradient(135deg, transparent 1%, #546efd 10%, #a377f0 30%, #be7fd3 55%, #df8880 70%, #ff7070 90%, transparent 100%) 1",
                    borderImageSlice: 1,
                }}
            >
                Career Details
            </Typography>

            <Typography sx={{ mb: 3, color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
                Tell us about your background, current work, and the direction you’re moving toward.
            </Typography>

            <Stack spacing={2.5} sx={{ width: "100%" }}>
                <Box>
                    <Typography sx={{ fontSize: 16, color: "#fff", pb: 1 }}>What is your highest education level?</Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {educations.map((education) => {
                            const selected = formData.education === education.value;
                            return (
                                <Chip
                                    key={education.value}
                                    label={education.label}
                                    onClick={() => handleChipSelect("education", education.value)}
                                    clickable
                                    sx={{
                                        cursor: "pointer",
                                        background: selected ? "linear-gradient(135deg, #546efd 0%, #a377f0 50%, #f48fb1 100%)" : "rgba(255, 255, 255, 0)",
                                        color: selected ? "#fff" : "rgba(255,255,255,0.75)",
                                        border: selected ? "1px solid transparent" : "1px solid rgba(255,255,255,0.25)",
                                        boxShadow: selected ? "0 8px 30px rgba(83,63,255,0.14)" : "none",
                                    }}
                                />
                            );
                        })}
                    </Box>
                </Box>

                <TextField
                    label="Institute"
                    name="educationInstitute"
                    value={formData.educationInstitute}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    sx={inputStyle}
                />

                <TextField
                    label="Job"
                    name="job"
                    value={formData.job}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    sx={inputStyle}
                />

                <TextField
                    label="Company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    sx={inputStyle}
                />

                <TextField
                    label="Title you want to get?"
                    name="toBecome"
                    value={formData.toBecome}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    sx={inputStyle}
                />
            </Stack>

            {errorMessage ? (
                <Typography sx={{ mt: 2, color: "#ffb4b4" }}>{errorMessage}</Typography>
            ) : null}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    sx={{
                        px: 4,
                        py: 1.2,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #546efd 0%, #a377f0 35%, #f48fb1 100%)",
                        boxShadow: "0 16px 28px rgba(99, 102, 241, 0.35)",
                        fontWeight: 700,
                        textTransform: "none",
                        "&:hover": {
                            background: "linear-gradient(135deg, #5c73ff 0%, #9a74f5 35%, #f59ec3 100%)",
                        },
                    }}
                >
                    {submitting ? "Saving..." : "Save Profile"}
                </Button>
            </Box>
        </Box>
    );
}

function Lifestyle() {
    const [formDetails, setFormDetails] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchFormDetails = async () => {
            try {
                const response = await apiGet("/get/user-form", { page: "lifestyle" });
                const details = response?.data?.data || {};

                // Keep this while the Lifestyle fields are being wired up.
                console.log("Lifestyle form details:", details);
                setFormDetails(details);
            } catch (error) {
                setErrorMessage(
                    error?.response?.data?.message || "Unable to load lifestyle form details right now."
                );
            }
        };

        fetchFormDetails();
    }, []);

    return (
        <Box sx={{ width: "100%" }}>
            <Typography
                variant="h3"
                sx={{
                    mb: 1,
                    fontWeight: 800,
                    display: "inline-block",
                    background: "linear-gradient(135deg, #f9c6ff 0%, #a5f3fc 28%, #c4b5fd 55%, #f9a8d4 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    paddingBottom: 1.5,
                    borderBottom: "3px solid transparent",
                    borderImage:
                        "linear-gradient(135deg, transparent 1%, #546efd 10%, #a377f0 30%, #be7fd3 55%, #df8880 70%, #ff7070 90%, transparent 100%) 1",
                    borderImageSlice: 1,
                }}
            >
                Lifestyle
            </Typography>

            {errorMessage ? (
                <Typography sx={{ mt: 2, color: "#ffb4b4" }}>{errorMessage}</Typography>
            ) : (
                <Typography sx={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
                    {formDetails ? "Lifestyle form details have been logged to the console." : "Loading lifestyle form details..."}
                </Typography>
            )}
        </Box>
    );
}

const MAX_MEDIA_FILES = 6;
const IMAGE_FILE_EXTENSION = /\.(avif|bmp|gif|heic|heif|jpe?g|png|webp)(?:$|[?#])/i;
const VIDEO_FILE_EXTENSION = /\.(3gp|m4v|mov|mp4|mpeg|mpg|ogg|webm)(?:$|[?#])/i;

const getSelectedFileType = (file) => {
    if (file.type?.startsWith("video/") || VIDEO_FILE_EXTENSION.test(file.name)) {
        return "video";
    }

    if (file.type?.startsWith("image/") || IMAGE_FILE_EXTENSION.test(file.name)) {
        return "image";
    }

    // Some iPhone browsers/WebViews provide neither MIME type nor a filename
    // extension for a photo selected from the native Photos library.
    if (!file.type) return "image";

    return null;
};

const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });

const getMediaUrl = (media) => {
    if (typeof media === "string") return media;

    return (
        media?.url ||
        media?.src ||
        media?.mediaUrl ||
        media?.imageUrl ||
        media?.videoUrl ||
        media?.secure_url ||
        media?.location ||
        ""
    );
};

const getMediaType = (media, url) => {
    const declaredType = typeof media === "object" ? media?.type || media?.mimeType : "";

    if (declaredType?.startsWith("video/")) return "video";

    return /\.(mp4|webm|ogg|mov|m4v)(?:[?#]|$)/i.test(url) ? "video" : "image";
};

const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const getExistingMedia = (profileUser) => {
    const mediaSources = [
        ...asArray(profileUser?.media),
        ...asArray(profileUser?.mediaUrls),
        ...asArray(profileUser?.images),
        ...asArray(profileUser?.photos),
        ...asArray(profileUser?.gallery),
        ...asArray(profileUser?.videos),
        ...asArray(profileUser?.videoUrls),
    ];
    const seenUrls = new Set();

    return mediaSources.reduce((items, media, index) => {
        const url = getMediaUrl(media);

        if (!url || seenUrls.has(url) || items.length === MAX_MEDIA_FILES) return items;

        seenUrls.add(url);
        items.push({
            id: `existing-${index}-${url}`,
            url,
            type: getMediaType(media, url),
            isExisting: true,
        });

        return items;
    }, []);
};

function Media({ profileUser }) {
    const currentUser = useAuthStore((state) => state.user);
    const fileInputRef = useRef(null);
    const [mediaItems, setMediaItems] = useState(() => getExistingMedia(profileUser));
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const selectedFiles = Array.from(event.target.files || []);
        // iPhone/Safari may give photos (notably HEIC/HEIF) an empty MIME type.
        // Use recognized filename extensions as a fallback in that case.
        const allowedFiles = selectedFiles.filter((file) => getSelectedFileType(file));
        const availableSlots = MAX_MEDIA_FILES - mediaItems.length;
        const filesToAdd = allowedFiles.slice(0, Math.max(availableSlots, 0));
        const selectionExceededLimit =
            selectedFiles.length !== allowedFiles.length || allowedFiles.length > availableSlots;

        // Allow the same file to be selected again after it has been removed.
        event.target.value = "";

        if (filesToAdd.length) {
            try {
                const selectionId = Date.now(); 
                const newItems = await Promise.all(
                    filesToAdd.map(async (file, index) => ({
                        id: `new-${selectionId}-${index}-${file.name}`,
                        file,
                        url: await readFileAsDataUrl(file),
                        type: getSelectedFileType(file),
                        isExisting: false,
                    }))
                );

                setMediaItems((previousItems) => [
                    ...previousItems,
                    ...newItems.slice(0, MAX_MEDIA_FILES - previousItems.length),
                ]);
            } catch {
                setErrorMessage("Unable to create a preview for the selected file.");
                return;
            }
        }

        if (!allowedFiles.length) {
            setErrorMessage("Please select image or video files only.");
        } else if (selectionExceededLimit) {
            setErrorMessage(`Only ${MAX_MEDIA_FILES} image or video files can be added.`);
        } else {
            setErrorMessage("");
        }
    };

    const removeMedia = (itemToRemove) => {
        setMediaItems((previousItems) =>
            previousItems.filter((item) => item.id !== itemToRemove.id)
        );
        setErrorMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const newFiles = mediaItems.filter((item) => item.file);

        if (!newFiles.length) {
            setErrorMessage("Add at least one photo or video to continue.");
            return;
        }

        setSubmitting(true);
        setErrorMessage("");

        try {
            const uploadRequests = newFiles.map((item, index) => {
                const form = new FormData();

                form.append("file", item.file);
                form.append("isPrimary", String(index === 0));
                form.append("order", String(index + 1));

                return apiPost("/upload/user-media", form);
            });

            const responses = await Promise.all(uploadRequests);
            const hasSuccessfulUpload = responses.some((response) => response?.data?.success !== false);

            if (hasSuccessfulUpload) {
                window.location.reload();
                return;
            }

            const firstError = responses.find((response) => response?.data?.success === false);
            setErrorMessage(
                firstError?.data?.message || "Unable to upload your media right now."
            );
        } catch (error) {
            setErrorMessage(
                error?.response?.data?.message || "Something went wrong while uploading your media."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const emptySlotCount = MAX_MEDIA_FILES - mediaItems.length;
    const mediaCardSx = {
        position: "relative",
        width: "100%",
        height: { xs: 108, sm: 300 },
        overflow: "hidden",
        borderRadius: 2,
        background: "#0c1517",
        border: "1px solid rgba(255,255,255,0.16)",
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <Typography
                variant="h3"
                sx={{
                    mb: 1,
                    fontWeight: 800,
                    display: "inline-block",
                    background: "linear-gradient(135deg, #f9c6ff 0%, #a5f3fc 28%, #c4b5fd 55%, #f9a8d4 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    paddingBottom: 1.5,
                    borderBottom: "3px solid transparent",
                    borderImage:
                        "linear-gradient(135deg, transparent 1%, #546efd 10%, #a377f0 30%, #be7fd3 55%, #df8880 70%, #ff7070 90%, transparent 100%) 1",
                    borderImageSlice: 1,
                }}
            >
                Add Photos & Videos
            </Typography>

            <Typography sx={{ mb: 3, color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
                Add up to {MAX_MEDIA_FILES} photos or videos to help people get to know you.
            </Typography>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                hidden
                onChange={handleFileChange}
            />

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: { xs: 1, sm: 1.5 },
                }}
            >
                {mediaItems.map((item) => (
                    <Box key={item.id} sx={mediaCardSx}>
                        {item.type === "video" ? (
                            <video
                                src={item.url}
                                controls
                                muted
                                playsInline
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            />
                        ) : (
                            <img
                                src={item.url}
                                alt="Selected profile media"
                                onError={() =>
                                    setErrorMessage("This image format cannot be previewed on this device.")
                                }
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                            />
                        )}

                        {item.type === "video" ? (
                            <PlayCircleOutlinedIcon
                                aria-hidden="true"
                                sx={{
                                    position: "absolute",
                                    left: 8,
                                    bottom: 8,
                                    color: "#fff",
                                    filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.65))",
                                }}
                            />
                        ) : null}

                        <IconButton
                            type="button"
                            aria-label="Remove media"
                            onClick={() => removeMedia(item)}
                            size="small"
                            sx={{
                                position: "absolute",
                                top: 6,
                                right: 6,
                                color: "#fff",
                                backgroundColor: "rgba(0,0,0,0.55)",
                                "&:hover": { backgroundColor: "rgba(0,0,0,0.75)" },
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ))}

                {Array.from({ length: emptySlotCount }).map((_, index) => (
                    <Box
                        key={`empty-slot-${index}`}
                        role="button"
                        tabIndex={0}
                        aria-label="Add photo or video"
                        onClick={openFilePicker}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                openFilePicker();
                            }
                        }}
                        sx={{
                            ...mediaCardSx,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.75,
                            cursor: "pointer",
                            color: "rgba(255,255,255,0.72)",
                            background:
                                "radial-gradient(circle at 20% 20%, rgba(84,110,253,0.3), transparent 48%), #0c1517",
                            "&:hover": {
                                borderColor: "rgba(196,181,253,0.9)",
                                color: "#fff",
                                transform: "translateY(-2px)",
                            },
                            "&:focus-visible": {
                                outline: "2px solid #c4b5fd",
                                outlineOffset: 2,
                            },
                            transition: "all 0.2s ease",
                        }}
                    >
                        <AddPhotoAlternateOutlinedIcon sx={{ fontSize: { xs: 28, sm: 34 } }} />
                        {mediaItems.length === 0 && index === 0 ? (
                            <Typography sx={{ fontSize: { xs: 10, sm: 12 }, textAlign: "center", px: 0.5 }}>
                                Add media
                            </Typography>
                        ) : null}
                    </Box>
                ))}
            </Box>

            <Typography sx={{ mt: 1.5, color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                {mediaItems.length} of {MAX_MEDIA_FILES} media files selected
            </Typography>

            {errorMessage ? (
                <Typography sx={{ mt: 2, color: "#ffb4b4" }}>{errorMessage}</Typography>
            ) : null}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    sx={{
                        px: 4,
                        py: 1.2,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #546efd 0%, #a377f0 35%, #f48fb1 100%)",
                        boxShadow: "0 16px 28px rgba(99, 102, 241, 0.35)",
                        fontWeight: 700,
                        textTransform: "none",
                        "&:hover": {
                            background: "linear-gradient(135deg, #5c73ff 0%, #9a74f5 35%, #f59ec3 100%)",
                        },
                    }}
                >
                    {submitting ? "Uploading..." : "Save Media"}
                </Button>
            </Box>
        </Box>
    );
}


export default CompleteProfile;
