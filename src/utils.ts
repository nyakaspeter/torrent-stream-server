import mime from "mime";

export const getStreamingMimeType = (filename: string) => {
  const mimeType = mime.getType(filename);
  return mimeType?.startsWith("video")
    ? "video/mp4"
    : mimeType || "application/unknown";
};

export const getHumanReadableDuration = (millisecs: number) => {
  var seconds = (millisecs / 1000).toFixed(1);
  var minutes = (millisecs / (1000 * 60)).toFixed(1);
  var hours = (millisecs / (1000 * 60 * 60)).toFixed(1);
  var days = (millisecs / (1000 * 60 * 60 * 24)).toFixed(1);

  if (Number(seconds) < 60) {
    return seconds + " seconds";
  } else if (Number(minutes) < 60) {
    return minutes + " minutes";
  } else if (Number(hours) < 24) {
    return hours + " hours";
  } else {
    return days + " days";
  }
};

export const isImdbId = (str: string) =>
  /ev\d{7}\/\d{4}(-\d)?|(ch|co|ev|nm|tt)\d{7}/.test(str);
