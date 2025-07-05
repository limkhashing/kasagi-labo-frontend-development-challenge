import { FC, useEffect, useState } from "react"
import { ActivityIndicator, View, ViewStyle } from "react-native"
import { ContentStyle } from "@shopify/flash-list"

import { AnimeCard } from "@/components/Anime/AnimeCard"
import { EmptyState } from "@/components/EmptyState"
import { ListView } from "@/components/ListView"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAnimeList } from "@/context/AnimeContext"
import { AnimeTabScreenProps } from "@/navigators/AnimeTabNavigator"
import type { JikenAnimeItem } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"
import { delay } from "@/utils/delay"

export const HomeScreen: FC<AnimeTabScreenProps<"Home">> = function HomeScreen(_props) {
  const { themed } = useAppTheme()
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const { animeForList, fetchAnimeList, toggleFavourite } = useAnimeList()

  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    ;(async function load() {
      setIsLoading(true)
      await fetchAnimeList(1)
      setIsLoading(false)
    })()
  }, [fetchAnimeList])

  // simulate a longer refresh, if the refresh is too fast for UX
  async function manualRefresh() {
    setRefreshing(true)
    await Promise.allSettled([fetchAnimeList(1), delay(750)])
    setRefreshing(false)
  }

  const handleLoadMore = async () => {
    if (isLoadingMore || isLoading) return
    setIsLoadingMore(true)
    await fetchAnimeList(page + 1)
    setPage((prev) => prev + 1)
    setIsLoadingMore(false)
  }

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <ListView<JikenAnimeItem>
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
              headingTx={"homeTab:emptyState.heading"}
              contentTx={"homeTab:emptyState.content"}
              buttonOnPress={manualRefresh}
              ImageProps={{ resizeMode: "contain" }}
            />
          )
        }
        ListHeaderComponent={
          <View style={themed($heading)}>
            <Text preset="heading" tx="homeTab:header" />
          </View>
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isLoadingMore ? <ActivityIndicator /> : null}
        renderItem={({ item }) => (
          <AnimeCard animeItem={item} onPressFavorite={() => toggleFavourite(item)} />
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
