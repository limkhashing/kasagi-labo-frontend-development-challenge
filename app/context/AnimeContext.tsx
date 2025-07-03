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
  fetchAnimeList: () => Promise<void>
  favoritesOnly: boolean
  toggleFavoritesOnly: () => void
  hasFavorite: (episode: JikenAnimeItem) => boolean
  toggleFavorite: (episode: JikenAnimeItem) => void
}

export const AnimeContext = createContext<AnimeContextType | null>(null)

export interface AnimeProviderProps {}

export const AnimeProvider: FC<PropsWithChildren<AnimeProviderProps>> = ({ children }) => {
  const [animeList, setAnimeList] = useState<JikenAnimeItem[]>([])
  const [favorites, setFavorites] = useState<number[]>([])
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false)

  const fetchAnimeList = useCallback(async () => {
    const response = await api.fetchAnimeList()
    if (response.kind === "ok") {
      setAnimeList(response.animeList)
    } else {
      console.error(`Error fetching anime: ${JSON.stringify(response)}`)
    }
  }, [])

  const toggleFavoritesOnly = useCallback(() => {
    setFavoritesOnly((prev) => !prev)
  }, [])

  const toggleFavorite = useCallback(
    (anime: JikenAnimeItem) => {
      if (favorites.some((fav) => fav === anime.mal_id)) {
        setFavorites((prev) => prev.filter((fav) => fav !== anime.mal_id))
      } else {
        setFavorites((prev) => [...prev, anime.mal_id])
      }
    },
    [favorites],
  )

  const hasFavorite = useCallback(
    (episode: JikenAnimeItem) => favorites.some((fav) => fav === episode.mal_id),
    [favorites],
  )

  const animeForList = useMemo(() => {
    return favoritesOnly ? animeList.filter((anime) => favorites.includes(anime.mal_id)) : animeList
  }, [animeList, favorites, favoritesOnly])

  const value = {
    animeForList,
    fetchAnimeList,
    favoritesOnly,
    toggleFavoritesOnly,
    hasFavorite,
    toggleFavorite,
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
  const { hasFavorite } = useAnimeList()

  const imageUrl = anime.images?.jpg?.image_url || anime.images?.webp?.image_url || ""
  const isFavorite = hasFavorite(anime)
  const title = anime.title
  let datePublished
  try {
    const formatted = formatDate(anime.aired.from)
    datePublished = {
      textLabel: formatted,
      accessibilityLabel: translate("demoPodcastListScreen:accessibility.publishLabel", {
        date: formatted,
      }),
    }
  } catch {
    datePublished = { textLabel: "", accessibilityLabel: "" }
  }
  const duration = anime.duration
  const synopsis = anime.synopsis
  const genres = anime.genres.map((genre) => genre.name).join(", ")

  return {
    imageUrl,
    title,
    isFavorite,
    datePublished,
    duration,
    synopsis,
    genres,
  }
}
