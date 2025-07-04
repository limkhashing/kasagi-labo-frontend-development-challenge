import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

import { translate } from "@/i18n/translate"
import { api } from "@/services/api"
import { JikenAnimeItem } from "@/services/api/types"
import { formatDate } from "@/utils/formatDate"

export type AnimeContextType = {
  animeForList: JikenAnimeItem[]
  fetchAnimeList: (page: number, limit?: number) => Promise<void>
  favouritesOnly: boolean
  toggleFavouritesOnly: () => void
  hasFavourite: (episode: JikenAnimeItem) => boolean
  toggleFavourite: (episode: JikenAnimeItem) => void
}

export const AnimeContext = createContext<AnimeContextType | null>(null)

export interface AnimeProviderProps {}

export const AnimeProvider: FC<PropsWithChildren<AnimeProviderProps>> = ({ children }) => {
  const [animeList, setAnimeList] = useState<JikenAnimeItem[]>([])
  const [favourites, setFavourites] = useState<number[]>([])
  const [favouritesOnly, setFavouritesOnly] = useState<boolean>(false)

  const fetchAnimeList = useCallback(async (page: number = 1, limit: number = 25) => {
    const response = await api.fetchAnimeList(page, limit)
    if (response.kind === "ok") {
      setAnimeList((prev) => (page === 1 ? response.animeList : [...prev, ...response.animeList]))
    } else {
      console.error(`Error fetching anime: ${JSON.stringify(response)}`)
    }
  }, [])

  const hasFavourite = useCallback(
    (anime: JikenAnimeItem) => favourites.some((fav) => fav === anime.mal_id),
    [favourites],
  )

  const toggleFavourite = useCallback((anime: JikenAnimeItem) => {
    setFavourites((previous) =>
      previous.includes(anime.mal_id)
        ? previous.filter((favourite) => favourite !== anime.mal_id)
        : [...previous, anime.mal_id],
    )
  }, [])

  const toggleFavouritesOnly = useCallback(() => {
    setFavouritesOnly((prev) => !prev)
  }, [])

  const animeForList = useMemo(() => {
    return favouritesOnly
      ? animeList.filter((anime) => favourites.includes(anime.mal_id))
      : animeList
  }, [animeList, favourites, favouritesOnly])

  const value = {
    animeForList,
    fetchAnimeList,
    favouritesOnly,
    toggleFavouritesOnly,
    hasFavourite,
    toggleFavourite,
  }

  return <AnimeContext.Provider value={value}>{children}</AnimeContext.Provider>
}

export const useAnimeList = () => {
  const context = useContext(AnimeContext)
  if (!context) throw new Error("useAnimeList must be used within an AnimeProvider")
  return context
}

// A helper hook to extract and format anime details
export const useAnime = (anime: JikenAnimeItem) => {
  const { hasFavourite } = useAnimeList()

  const imageUrl = anime.images?.jpg?.image_url || anime.images?.webp?.image_url || ""
  const isFavourite = hasFavourite(anime)
  const title = anime.title
  let datePublished
  try {
    const formatted = formatDate(anime.aired.from)
    datePublished = {
      textLabel: translate("demoPodcastListScreen:accessibility.publishLabel", {
        date: formatted,
      }),
    }
  } catch {
    datePublished = { textLabel: "" }
  }
  const duration = anime.duration
  const synopsis = anime.synopsis
  const genres = anime.genres.map((genre) => genre.name).join(", ")

  return {
    imageUrl,
    title,
    isFavourite,
    datePublished,
    duration,
    synopsis,
    genres,
  }
}
