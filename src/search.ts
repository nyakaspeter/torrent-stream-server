import { JackettCategory } from "ts-jackett-api/lib/types/JackettCategory.js";
import { searchEztv } from "./sources/eztv.js";
import {
  ItorrentCategory,
  ItorrentQuality,
  searchItorrent,
} from "./sources/itorrent.js";
import { searchJackett } from "./sources/jackett.js";
import { NcoreCategory, searchNcore } from "./sources/ncore.js";
import { searchYts } from "./sources/yts.js";

export type TorrentCategory = "movie" | "show";

export type TorrentSource = "jackett" | "ncore" | "itorrent" | "yts" | "eztv";

export interface TorrentSearchOptions {
  categories?: TorrentCategory[];
  sources?: TorrentSource[];
  jackett?: {
    url?: string;
    apiKey?: string;
  };
  ncore?: {
    user?: string;
    password?: string;
  };
}

export interface TorrentSearchResult {
  name: string;
  tracker: string;
  category?: string;
  size?: number;
  seeds?: number;
  peers?: number;
  torrent?: string;
  magnet?: string;
}

export const searchTorrents = async (
  query: string,
  options?: TorrentSearchOptions
) => {
  const searchAllCategories = !options?.categories?.length;
  const searchAllSources = !options?.sources?.length;

  const promises = [];

  if (options?.sources?.includes("jackett") || searchAllSources) {
    const categories = new Set<JackettCategory>();

    if (options?.categories?.includes("movie") || searchAllCategories) {
      categories.add(JackettCategory.Movies);
    }

    if (options?.categories?.includes("show") || searchAllCategories) {
      categories.add(JackettCategory.TV);
    }

    promises.push(
      searchJackett(
        query,
        Array.from(categories),
        options?.jackett?.url,
        options?.jackett?.apiKey
      )
    );
  }

  if (options?.sources?.includes("ncore") || searchAllSources) {
    const categories = new Set<NcoreCategory>();

    if (options?.categories?.includes("movie") || searchAllCategories) {
      categories.add(NcoreCategory.Film_HD_HU);
      categories.add(NcoreCategory.Film_HD_EN);
      categories.add(NcoreCategory.Film_SD_HU);
      categories.add(NcoreCategory.Film_SD_EN);
    }

    if (options?.categories?.includes("show") || searchAllCategories) {
      categories.add(NcoreCategory.Sorozat_HD_HU);
      categories.add(NcoreCategory.Sorozat_HD_EN);
      categories.add(NcoreCategory.Sorozat_SD_HU);
      categories.add(NcoreCategory.Sorozat_SD_EN);
    }

    promises.push(
      searchNcore(
        query,
        Array.from(categories),
        options?.ncore?.user,
        options?.ncore?.password
      )
    );
  }

  if (options?.sources?.includes("itorrent") || searchAllSources) {
    const categories = new Set<ItorrentCategory>();

    if (options?.categories?.includes("movie") || searchAllCategories) {
      categories.add(ItorrentCategory.Film);
    }

    if (options?.categories?.includes("show") || searchAllCategories) {
      categories.add(ItorrentCategory.Sorozat);
    }

    const qualities = [
      ItorrentQuality.HD,
      ItorrentQuality.SD,
      ItorrentQuality.CAM,
    ];

    promises.push(searchItorrent(query, Array.from(categories), qualities));
  }

  if (options?.sources?.includes("yts") || searchAllSources) {
    if (options?.categories?.includes("movie") || searchAllCategories) {
      promises.push(searchYts(query));
    }
  }

  if (options?.sources?.includes("eztv") || searchAllSources) {
    if (options?.categories?.includes("show") || searchAllCategories) {
      promises.push(searchEztv(query));
    }
  }

  const results = (await Promise.all(promises)).flat();

  console.log(`🔍 ${results.length} results for ${query}`);

  return results;
};
