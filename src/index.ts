import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { router } from "./router";

const PORT = Number(process.env.PORT) || 8000;

express()
  .use(express.json())
  .use(router)
  .listen(PORT, () => {
    console.log(`Torrent stream server listening on port ${PORT}`);
  });
