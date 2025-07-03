/**
 * These types indicate the shape of the data you expect to receive from your
 * API endpoint, assuming it's a JSON object like we have.
 */
export interface EpisodeItem {
  title: string
  pubDate: string
  link: string
  guid: string
  author: string
  thumbnail: string
  description: string
  content: string
  enclosure: {
    link: string
    type: string
    length: number
    duration: number
    rating: { scheme: string; value: string }
  }
  categories: string[]
}

export interface ApiFeedResponse {
  status: string
  feed: {
    url: string
    title: string
    link: string
    author: string
    description: string
    image: string
  }
  items: EpisodeItem[]
}

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

export interface JikenAnimeApiResponse {
  pagination: JikenAnimePagination
  data: JikenAnimeItem[]
}

export interface JikenAnimeItem {
  mal_id: number
  url: string
  images: {
    jpg: { image_url: string; small_image_url: string; large_image_url: string }
    webp: { image_url: string; small_image_url: string; large_image_url: string }
  }
  title: string
  title_english?: string
  title_japanese?: string
  type: string
  source: string
  episodes: number | null
  status: string
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

export interface JikenAnimePagination {
  last_visible_page: number
  has_next_page: boolean
  current_page: number
  items: {
    count: number
    total: number
    per_page: number
  }
}
