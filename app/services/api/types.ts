/**
 * The options used to configure apisauce.
 */
export interface ApiConfig {
  /**
   * The URL of the api.
   */
  url: string

  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number
}

export interface JikanAnimeApiResponse {
  pagination: JikanAnimePagination
  data: JikanAnimeItem[]
}

export interface JikanAnimeItem {
  mal_id: number
  url: string
  images: {
    jpg: { image_url: string; small_image_url: string; large_image_url: string }
    webp: { image_url: string; small_image_url: string; large_image_url: string }
  }
  title: string
  airing: boolean
  aired: {
    from: string
  }
  duration: string
  rating: string
  score: number | null
  synopsis: string
  season?: string
  year?: number
  genres: { mal_id: number; type: string; name: string; url: string }[]
}

export interface JikanAnimePagination {
  last_visible_page: number
  has_next_page: boolean
  current_page: number
  items: {
    count: number
    total: number
    per_page: number
  }
}
