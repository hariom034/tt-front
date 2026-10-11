import { Box, Skeleton, Stack } from "@mui/material";
import { useState } from "react";

const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);
const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const resolveMediaUrl = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    if (/^https?:\/\//i.test(value)) return value;
    const cleanValue = value.startsWith("/") ? value.slice(1) : value;
    return `${API_BASE_URL}/${cleanValue}`;
  }

  const fileName =
    value?.fileName ||
    value?.name ||
    value?.url ||
    value?.src ||
    value?.mediaUrl ||
    value?.imageUrl ||
    value?.videoUrl ||
    value?.secure_url ||
    value?.location ||
    value?.profileImage ||
    "";

  if (!fileName) return "";

  if (/^https?:\/\//i.test(fileName)) return fileName;

  const cleanFileName = fileName.startsWith("/") ? fileName.slice(1) : fileName;
  return `${API_BASE_URL}/${cleanFileName}`;
};

const getMediaUrl = (item) => {
  if (!item) return "";

  if (typeof item === "string") return resolveMediaUrl(item);

  return (
    resolveMediaUrl(item?.fileName) ||
    resolveMediaUrl(item?.url) ||
    resolveMediaUrl(item?.src) ||
    resolveMediaUrl(item?.mediaUrl) ||
    resolveMediaUrl(item?.imageUrl) ||
    resolveMediaUrl(item?.videoUrl) ||
    resolveMediaUrl(item?.secure_url) ||
    resolveMediaUrl(item?.location) ||
    resolveMediaUrl(item?.profileImage) ||
    ""
  );
};

function SafeMediaImage({ url, index }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed || !url) return null;

  return (
    <Box
      component="img"
      key={`${url}-${index}`}
      src={url}
      alt={`media-${index + 1}`}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      sx={{
        width: "100%",
        maxHeight: "75vh",
        objectFit: "cover",
        display: loaded ? "block" : "none",
        background: "rgba(255,255,255,0.04)",
        borderRadius: 0,
      }}
    />
  );
}

export default function PostMedia({ loading = false, profileUser = {} }) {
  const mediaItems = [
    ...asArray(profileUser?.profileImage),
    ...asArray(profileUser?.media),
    ...asArray(profileUser?.mediaUrls),
    ...asArray(profileUser?.images),
    ...asArray(profileUser?.photos),
    ...asArray(profileUser?.gallery),
    ...asArray(profileUser?.videos),
    ...asArray(profileUser?.videoUrls),
  ]
    .map((item) => getMediaUrl(item))
    .filter(Boolean)
    .reduce((unique, url) => {
      const normalized = decodeURIComponent(url)
        .trim()
        .split("?")[0]
        .replace(/\/+$/, "")
        .toLowerCase();

      if (!unique.seen.has(normalized)) {
        unique.seen.add(normalized);
        unique.items.push(url);
      }
      return unique;
    }, { seen: new Set(), items: [] }).items
    .slice(0, 6);

  const gallery = mediaItems;

  if (loading) {
    return (
      <Stack sx={{ width: "100%", px: 0, py: 0 }}>
        <Skeleton variant="rectangular" height={420} sx={{ width: "100%", borderRadius: 0 }} />
      </Stack>
    );
  }

  if (!gallery.length) return null;

  return (
    <Stack sx={{ width: "100%", bgcolor: "#090a0f" }}>
      {gallery.map((url, index) => (
        <SafeMediaImage key={`${url}-${index}`} url={url} index={index} />
      ))}
    </Stack>
  );
}
