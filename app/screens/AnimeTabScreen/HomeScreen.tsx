import { FC, useEffect, useState } from "react"
import { ActivityIndicator, View, ViewStyle } from "react-native"
import { ContentStyle } from "@shopify/flash-list"

import { EmptyState } from "@/components/EmptyState"
import { ListView } from "@/components/ListView"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { Checkbox } from "@/components/Toggle/Checkbox"
import { useAnimeList } from "@/context/AnimeContext"
import { AnimeTabScreenProps } from "@/navigators/AnimeTabNavigator"
import { AnimeCard } from "@/screens/AnimeTabScreen/AnimeCard"
import type { JikanAnimeItem } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"
import { delay } from "@/utils/delay"

/**
 * In a real application, these genres would likely be fetched from an API or defined in a more dynamic way.
 * Here, we define a static list for demonstration purposes.
 * The genres array is referred based on the Jikan API https://api.jikan.moe/v4/genres/anime
 */
const genres = [
  { mal_id: 1, name: "Action" },
  { mal_id: 8, name: "Comedy" },
  { mal_id: 46, name: "Award Winning" },
]

export const HomeScreen: FC<AnimeTabScreenProps<"Home">> = function HomeScreen(_props) {
  const { themed } = useAppTheme()
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setError] = useState(false)
  const [page, setPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])

  const { animeForList, fetchAnimeList, toggleFavouriteStatus } = useAnimeList()

  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    // Fetch anime list with selected genres whenever they change
    ;(async () => {
      setIsLoading(true)
      const isError = await fetchAnimeList(1, undefined, selectedGenres)
      setError(isError)
      setIsLoading(false)
      setPage(1)
    })()
  }, [fetchAnimeList, selectedGenres])

  // simulate a longer refresh, if the refresh is too fast for UX
  async function manualRefresh() {
    setRefreshing(true)
    const isError = await fetchAnimeList(1, undefined, selectedGenres)
    setError(isError)
    await delay(750)
    setRefreshing(false)
  }

  const handleLoadMore = async () => {
    if (isLoadingMore || isLoading) return
    setIsLoadingMore(true)
    const isError = await fetchAnimeList(page + 1, undefined, selectedGenres)
    setError(isError)
    setPage((prev) => prev + 1)
    setIsLoadingMore(false)
  }

  const handleGenresCheckbox = (mal_id: number) => {
    setSelectedGenres((previousGenres) =>
      previousGenres.includes(mal_id)
        ? previousGenres.filter((id) => id !== mal_id)
        : [...previousGenres, mal_id],
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <ListView<JikanAnimeItem>
        numColumns={2}
        contentContainerStyle={themed([$styles.container, $listContentContainer])}
        data={animeForList}
        keyExtractor={(anime) => anime.mal_id.toString()}
        refreshing={refreshing}
        estimatedItemSize={25}
        onRefresh={manualRefresh}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator />
          ) : (
            <EmptyState
              preset="generic"
              style={themed($emptyState)}
              headingTx={isError ? "homeTab:errorState.heading" : "homeTab:emptyState.heading"}
              contentTx={isError ? "homeTab:errorState.content" : "homeTab:emptyState.content"}
              buttonTx={isError ? "homeTab:errorState.button" : "homeTab:emptyState.button"}
              buttonOnPress={manualRefresh}
              ImageProps={{ resizeMode: "contain" }}
            />
          )
        }
        ListHeaderComponent={
          <View style={themed($heading)}>
            <Text preset="heading" tx="homeTab:header" />
            <View style={themed($genreRow)}>
              {genres.map((genre) => (
                <View key={genre.mal_id} style={themed($genreCheckboxContainer)}>
                  <Checkbox
                    value={selectedGenres.includes(genre.mal_id)}
                    onValueChange={() => handleGenresCheckbox(genre.mal_id)}
                  />
                  <Text style={themed($genreText)}>{genre.name}</Text>
                </View>
              ))}
            </View>
          </View>
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isLoadingMore ? <ActivityIndicator /> : null}
        renderItem={({ item }) => (
          <AnimeCard animeItem={item} onPressFavorite={() => toggleFavouriteStatus(item)} />
        )}
      />
    </Screen>
  )
}

const $listContentContainer: ThemedStyle<ContentStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.sm,
})

const $heading: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $emptyState: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xxl,
})

const $genreRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
  marginTop: spacing.xs,
})

const $genreCheckboxContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginRight: spacing.sm,
})

const $genreText: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginLeft: spacing.xxs,
})
