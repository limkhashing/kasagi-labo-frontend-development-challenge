/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/#backend-api-integration)
 * documentation for more details.
 */
import { ApiResponse, ApisauceInstance, create } from "apisauce"

import Config from "@/config"
import type { JikanAnimeApiResponse, JikanAnimeItem } from "@/services/api/types"

import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import type { ApiConfig } from "./types"

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })
  }

  async fetchAnimeList(
    page: number = 1,
    limit: number = 25,
    genres?: number[],
  ): Promise<{ kind: "ok"; animeList: JikanAnimeItem[] } | GeneralApiProblem> {
    const response: ApiResponse<JikanAnimeApiResponse> = await this.apisauce.get("/v4/anime", {
      page: page,
      limit: limit,
      genres: genres?.join(","),
    })

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    const animeList = response.data?.data ?? []
    return { kind: "ok", animeList: animeList }
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
