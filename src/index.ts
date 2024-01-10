import express from "express";
import {
  getFile,
  getOrAddTorrent,
  getTorrentInfo,
  updateAccessTime,
} from "./webtorrent.js";
import { getStreamingMimeType } from "./utils.js";

const PORT = Number(process.env.PORT) || 8000;

const app = express();

app.get("/torrent/:torrentUri", async (req, res) => {
  const { torrentUri } = req.params;

  const torrent = await getTorrentInfo(torrentUri);
  if (!torrent) return res.status(500).send("Failed to get torrent");

  torrent.files.forEach((file) => {
    file.url = [
      `${req.protocol}://${req.get("host")}`,
      "stream",
      encodeURIComponent(torrentUri),
      encodeURIComponent(file.path),
    ].join("/");
  });

  res.json(torrent);
});

app.get("/stream/:torrentUri/:filePath", async (req, res) => {
  const { torrentUri, filePath } = req.params;

  const torrent = await getOrAddTorrent(torrentUri);
  if (!torrent) return res.status(500).send("Failed to add torrent");

  updateAccessTime(torrent.infoHash);

  const file = getFile(torrent, filePath);
  if (!file) return res.status(404).send("File not found");

  let { range } = req.headers;
  if (!range) range = "bytes=0-";

  const positions = range.replace(/bytes=/, "").split("-");
  const start = Number(positions[0]);
  const end = Math.min(start + torrent.pieceLength, file.length - 1);

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${file.length}`,
    "Accept-Ranges": "bytes",
    "Content-Length": end - start + 1,
    "Content-Type": getStreamingMimeType(file.name),
  };

  res.writeHead(206, headers);

  try {
    const videoStream = file.createReadStream({ start, end });
    videoStream.on("error", () => {});
    videoStream.pipe(res);
  } catch (error) {
    res.status(500).end();
  }
});

app.listen(PORT, () => {
  console.log(`Torrent stream server listening on port ${PORT}`);
});
