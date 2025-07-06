import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { ActivityIndicator } from "react-native"

import { translate } from "@/i18n/translate"
import { api } from "@/services/api"
import { JikanAnimeItem } from "@/services/api/types"
import { formatDate } from "@/utils/formatDate"
import { load, save } from "@/utils/storage"

const FAVOURITES_KEY = "favourites"

export type AnimeContextType = {
  animeForList: JikanAnimeItem[]
  fetchAnimeList: (page: number, limit?: number, genres?: number[]) => Promise<boolean>
  hasFavourite: (episode: JikanAnimeItem) => boolean
  toggleFavouriteStatus: (episode: JikanAnimeItem) => void
}

export const AnimeContext = createContext<AnimeContextType | null>(null)

export interface AnimeProviderProps {}

export const AnimeProvider: FC<PropsWithChildren<AnimeProviderProps>> = ({ children }) => {
  const [animeList, setAnimeList] = useState<JikanAnimeItem[]>([])
  const [favourites, setFavourites] = useState<number[]>([])
  const [favouritesLoaded, setFavouritesLoaded] = useState(false)

  // Load favourites from MMKV on mount
  useEffect(() => {
    const storedFavourites = load<number[]>(FAVOURITES_KEY)
    if (storedFavourites && Array.isArray(storedFavourites)) {
      setFavourites(storedFavourites)
    }
    setFavouritesLoaded(true)
  }, [])

  // Save favourites to MMKV whenever they change
  useEffect(() => {
    if (favouritesLoaded) {
      save(FAVOURITES_KEY, favourites)
    }
  }, [favourites, favouritesLoaded])

  /**
   * Fetches a list of anime from the API.
   * @param page - The page number to fetch (default is 1).
   * @param limit - The number of items per page (default is 25).
   * @return A promise that resolves to a boolean indicating if there was an error.
   */
  const fetchAnimeList = useCallback(
    async (page: number = 1, limit: number = 25, genres?: number[]) => {
      const response = await api.fetchAnimeList(page, limit, genres)
      if (response.kind === "ok") {
        setAnimeList((prev) => (page === 1 ? response.animeList : [...prev, ...response.animeList]))
        return false
      } else {
        console.error(`Error fetching anime: ${JSON.stringify(response)}`)
        return true
      }
    },
    [],
  )

  const hasFavourite = useCallback(
    (anime: JikanAnimeItem) => favourites.some((id) => id === anime.mal_id),
    [favourites],
  )

  const toggleFavouriteStatus = useCallback((anime: JikanAnimeItem) => {
    setFavourites((previous) =>
      previous.includes(anime.mal_id)
        ? previous.filter((favourite) => favourite !== anime.mal_id)
        : [...previous, anime.mal_id],
    )
  }, [])

  const animeForList = useMemo(() => {
    return animeList
  }, [animeList])

  const value = {
    animeForList,
    fetchAnimeList,
    hasFavourite,
    toggleFavouriteStatus,
  }

  if (!favouritesLoaded) return <ActivityIndicator />

  return <AnimeContext.Provider value={value}>{children}</AnimeContext.Provider>
}

export const useAnimeList = () => {
  const context = useContext(AnimeContext)
  if (!context) throw new Error("useAnimeList must be used within an AnimeProvider")
  return context
}

// A helper hook to extract and format anime details
export const useAnimeDetails = (anime: JikanAnimeItem) => {
  const { hasFavourite } = useAnimeList()

  const imageUrl = anime.images?.jpg?.image_url || anime.images?.webp?.image_url || ""
  const isFavourite = hasFavourite(anime)
  const title = anime.title
  let dateAired
  try {
    const formatted = formatDate(anime.aired.from)
    dateAired = translate("detailsScreen:aired", { date: formatted })
  } catch {
    dateAired = translate("detailsScreen:aired", { date: "Unknown" })
  }
  const duration = anime.duration
  const synopsis = anime.synopsis
  const genres = anime.genres.map((genre) => genre.name).join(", ")

  return {
    imageUrl,
    title,
    isFavourite,
    dateAired,
    duration,
    synopsis,
    genres,
  }
}
