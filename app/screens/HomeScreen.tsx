import { ComponentType, FC, useCallback, useEffect, useMemo, useState } from "react"
import { ActivityIndicator, ImageStyle, StyleSheet, TextStyle, View, ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { ContentStyle } from "@shopify/flash-list"
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"

import { AutoImage } from "@/components/AutoImage"
import { Button, ButtonAccessoryProps } from "@/components/Button"
import { Card } from "@/components/Card"
import { EmptyState } from "@/components/EmptyState"
import { Icon } from "@/components/Icon"
import { ListView } from "@/components/ListView"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { Switch } from "@/components/Toggle/Switch"
import { useAnime, useAnimeList } from "@/context/AnimeContext"
import { translate } from "@/i18n/translate"
import { AnimeTabScreenProps } from "@/navigators/AnimeTabNavigator"
import { AnimeDetails } from "@/screens/DetailsScreen"
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

  const { animeForList, fetchAnimeList, favouritesOnly, toggleFavouritesOnly, toggleFavourite } =
    useAnimeList()

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
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$styles.flex1}>
      <ListView<JikenAnimeItem>
        numColumns={2}
        contentContainerStyle={themed([$styles.container, $listContentContainer])}
        data={animeForList}
        keyExtractor={(item) => item.mal_id.toString()}
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
              headingTx={favouritesOnly ? "emptyStateComponent:generic.heading" : undefined}
              contentTx={favouritesOnly ? "emptyStateComponent:generic.content" : undefined}
              button={favouritesOnly ? "" : undefined}
              buttonOnPress={manualRefresh}
              ImageProps={{ resizeMode: "contain" }}
            />
          )
        }
        ListHeaderComponent={
          <View style={themed($heading)}>
            <Text preset="heading" text="AnimeExplorer" />
            {(favouritesOnly || animeForList.length > 0) && (
              <View style={themed($toggle)}>
                <Switch
                  value={favouritesOnly}
                  onValueChange={() => toggleFavouritesOnly()}
                  labelTx="homeTab:onlyFavorites"
                  labelPosition="left"
                  labelStyle={$labelStyle}
                />
              </View>
            )}
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

const AnimeCard = ({
  animeItem,
  onPressFavorite,
}: {
  animeItem: JikenAnimeItem
  onPressFavorite: () => void
}) => {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const { imageUrl, title, isFavourite, datePublished, duration, synopsis, genres } =
    useAnime(animeItem)
  const navigation = useNavigation()

  const liked = useSharedValue(isFavourite ? 1 : 0)

  // Grey heart
  const animatedLikeButtonStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(liked.value, [0, 1], [1, 0], Extrapolation.EXTEND),
        },
      ],
      opacity: interpolate(liked.value, [0, 1], [1, 0], Extrapolation.CLAMP),
    }
  })

  // Pink heart
  const animatedUnlikeButtonStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: liked.value,
        },
      ],
      opacity: liked.value,
    }
  })

  const handlePressFavorite = useCallback(() => {
    onPressFavorite()
    liked.value = withSpring(liked.value ? 0 : 1)
  }, [liked, onPressFavorite])

  const navigateToDetailsScreen = () => {
    const animeDetails: AnimeDetails = {
      imageUrl,
      title,
      datePublished: datePublished.textLabel,
      duration,
      synopsis,
      genres,
    }
    navigation.navigate("Details", { anime: animeDetails })
  }

  const ButtonLeftAccessory: ComponentType<ButtonAccessoryProps> = useMemo(
    () =>
      function ButtonLeftAccessory() {
        return (
          <View>
            <Animated.View
              style={[
                $styles.row,
                themed($iconContainer),
                StyleSheet.absoluteFill,
                animatedLikeButtonStyles,
              ]}
            >
              <Icon
                icon="heart"
                size={ICON_SIZE}
                color={colors.palette.neutral800} // dark grey
              />
            </Animated.View>
            <Animated.View
              style={[$styles.row, themed($iconContainer), animatedUnlikeButtonStyles]}
            >
              <Icon
                icon="heart"
                size={ICON_SIZE}
                color={colors.palette.primary400} // pink
              />
            </Animated.View>
          </View>
        )
      },
    [animatedLikeButtonStyles, animatedUnlikeButtonStyles, colors, themed],
  )

  return (
    <Card
      style={themed($item)}
      onPress={navigateToDetailsScreen}
      HeadingComponent={<AutoImage source={{ uri: imageUrl }} style={themed($itemImage)} />}
      content={title}
      FooterComponent={
        <Button
          onPress={handlePressFavorite}
          style={themed([$favoriteButton, isFavourite && $unFavoriteButton])}
          LeftAccessory={ButtonLeftAccessory}
        >
          <Text
            size="xxs"
            weight="medium"
            text={
              isFavourite
                ? translate("homeTab:unfavoriteButton")
                : translate("homeTab:favoriteButton")
            }
          />
        </Button>
      }
    />
  )
}

// #region Styles
const ICON_SIZE = 14

const $listContentContainer: ThemedStyle<ContentStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.sm,
})

const $heading: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $emptyState: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xxl,
})

const $toggle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
})

const $labelStyle: TextStyle = {
  textAlign: "left",
}

const $iconContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  height: ICON_SIZE,
  width: ICON_SIZE,
  marginEnd: spacing.sm,
})

const $item: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  padding: spacing.xs,
  margin: spacing.xs,
  minHeight: 300,
  backgroundColor: colors.palette.neutral100,
  flex: 1,
})

const $itemImage: ThemedStyle<ImageStyle> = ({ colors }) => ({
  width: "100%",
  height: 200,
  backgroundColor: colors.palette.neutral300,
})

const $favoriteButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderRadius: 17,
  marginTop: spacing.md,
  justifyContent: "flex-start",
  backgroundColor: colors.palette.neutral300,
  borderColor: colors.palette.neutral300,
  paddingHorizontal: spacing.md,
  paddingTop: spacing.xxxs,
  paddingBottom: 0,
  minHeight: 32,
  alignSelf: "flex-start",
})

const $unFavoriteButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.palette.primary100,
  backgroundColor: colors.palette.primary100,
})
