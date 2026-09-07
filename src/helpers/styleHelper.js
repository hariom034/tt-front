export const inputStyle = {
    width: "100%",
    "& .MuiOutlinedInput-root": {
        backgroundColor: "transparent",
        borderRadius: 0,
        "& fieldset": {
            border: "none",
            borderBottom: "1px solid rgba(255,255,255,0.65)",
            borderRadius: 0,
        },
        "&:hover fieldset": {
            borderBottom: "1px solid #ffffff",
        },
        "&.Mui-focused fieldset": {
            borderBottom: "2px solid #ffffff",
            borderColor: "#ffffff",
        },
    },
    "& .MuiInputLabel-root": {
        color: "rgba(255,255,255,0.85)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
        color: "#ffffff",
    },
    "& .MuiOutlinedInput-input": {
        color: "#ffffff",
        paddingTop: "18px",
        paddingBottom: "10px",
    },
};

