import { useState } from "react";
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
} from "@mui/material";
import { inputStyle } from "../helpers/styleHelper";
import { apiPost } from "../api/api";
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


  const maritalStatuses = ["single", "divorced", "widowed", "separated"];
  const religions = ["atheist", "agnostic", "hindu", "muslim", "sikh", "buddhist", "jain", "christian"];

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
            const selected = formData.religion === religion;
            return (
              <Chip
                key={religion}
                label={religion.charAt(0).toUpperCase() + religion.slice(1)}
                onClick={() => handleChipSelect("religion", religion)}
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



export default CompleteProfile;
