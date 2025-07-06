import { FC } from "react"
import { View, ViewStyle } from "react-native"
import { ContentStyle } from "@shopify/flash-list"

import { EmptyState } from "@/components/EmptyState"
import { ListView } from "@/components/ListView"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAnimeList } from "@/context/AnimeContext"
import { AnimeTabScreenProps } from "@/navigators/AnimeTabNavigator"
import { AnimeCard } from "@/screens/AnimeTabScreen/AnimeCard"
import type { JikanAnimeItem } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

export const FavouritesScreen: FC<AnimeTabScreenProps<"Favourites">> = function FavouritesScreen(
  _props,
) {
  const { themed } = useAppTheme()
  const { animeForList, hasFavourite } = useAnimeList()

  const favouritesList = animeForList.filter((anime) => hasFavourite(anime))

  return (
    <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
      <ListView<JikanAnimeItem>
        numColumns={2}
        contentContainerStyle={themed([$styles.container, $listContentContainer])}
        data={favouritesList}
        keyExtractor={(anime) => anime.mal_id.toString()}
        estimatedItemSize={10}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            preset="generic"
            style={themed($emptyState)}
            headingTx={"noFavoritesEmptyState:heading"}
            contentTx={"noFavoritesEmptyState:content"}
            ImageProps={{ resizeMode: "contain" }}
          />
        }
        ListHeaderComponent={
          <View style={themed($heading)}>
            <Text preset="heading" text="Favourites" />
          </View>
        }
        renderItem={({ item }) => <AnimeCard animeItem={item} showFavoriteButton={false} />}
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
