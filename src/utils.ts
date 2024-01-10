import mime from "mime";

export const getStreamingMimeType = (filename: string) => {
  const mimeType = mime.getType(filename);
  return mimeType?.startsWith("video")
    ? "video/mp4"
    : mimeType || "application/unknown";
};
