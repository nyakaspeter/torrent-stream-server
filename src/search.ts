import { searchJackett } from "./sources/jackett.js";
import { JackettCategory } from "ts-jackett-api/lib/types/JackettCategory.js";

export type TorrentCategory = "movie" | "show";

export type TorrentSource = "jackett";

export interface TorrentSearchOptions {
  categories?: TorrentCategory[];
  sources?: TorrentSource[];
  jackett?: {
    url?: string;
    apiKey?: string;
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
    const categories = [];

    if (options?.categories?.includes("movie") || searchAllCategories)
      categories.push(JackettCategory.Movies);
    if (options?.categories?.includes("show") || searchAllCategories)
      categories.push(JackettCategory.TV);

    promises.push(
      searchJackett(
        query,
        categories,
        options?.jackett?.url,
        options?.jackett?.apiKey
      )
    );
  }

  return (await Promise.all(promises)).flat();
};
