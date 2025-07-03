import { ComponentType, FC, ReactElement, useCallback, useEffect, useMemo, useState } from "react"
import { ActivityIndicator, ImageStyle, StyleSheet, TextStyle, View, ViewStyle } from "react-native"
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
import { isRTL, TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"
import { DemoTabScreenProps } from "@/navigators/DemoNavigator"
import type { JikenAnimeItem } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { Theme, ThemedStyle } from "@/theme/types"
import { delay } from "@/utils/delay"

export interface Demo {
  name: string
  description: TxKeyPath
  data: ({ themed, theme }: { themed: any; theme: Theme }) => ReactElement[]
}

export const HomeScreen: FC<DemoTabScreenProps<"Home">> = function HomeScreen(_props) {
  const { themed } = useAppTheme()
  const { animeForList, fetchAnimeList, favoritesOnly, toggleFavoritesOnly, toggleFavorite } =
    useAnimeList()

  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    ;(async function load() {
      setIsLoading(true)
      await fetchAnimeList()
      setIsLoading(false)
    })()
  }, [fetchAnimeList])

  // simulate a longer refresh, if the refresh is too fast for UX
  async function manualRefresh() {
    setRefreshing(true)
    await Promise.allSettled([fetchAnimeList(), delay(750)])
    setRefreshing(false)
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
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator />
          ) : (
            <EmptyState
              preset="generic"
              style={themed($emptyState)}
              headingTx={
                favoritesOnly ? "demoPodcastListScreen:noFavoritesEmptyState.heading" : undefined
              }
              contentTx={
                favoritesOnly ? "demoPodcastListScreen:noFavoritesEmptyState.content" : undefined
              }
              button={favoritesOnly ? "" : undefined}
              buttonOnPress={manualRefresh}
              imageStyle={$emptyStateImage}
              ImageProps={{ resizeMode: "contain" }}
            />
          )
        }
        ListHeaderComponent={
          <View style={themed($heading)}>
            {(favoritesOnly || animeForList.length > 0) && (
              <View style={themed($toggle)}>
                <Switch
                  value={favoritesOnly}
                  onValueChange={() => toggleFavoritesOnly()}
                  labelTx="demoPodcastListScreen:onlyFavorites"
                  labelPosition="left"
                  labelStyle={$labelStyle}
                  accessibilityLabel={translate("demoPodcastListScreen:accessibility.switch")}
                />
              </View>
            )}
          </View>
        }
        // renderItem={({ item }) => (
        //   <TouchableOpacity activeOpacity={0.8} style={{ flex: 1, margin: spacing.sm }}>
        //     <Card
        //       HeadingComponent={
        //         <AutoImage source={{ uri: item.images.jpg.image_url }} style={{ width: "100%", height: 200 }} />
        //       }
        //       content={item.title}
        //     />
        //   </TouchableOpacity>
        // )}

        renderItem={({ item }) => (
          <AnimeCard anime={item} onPressFavorite={() => toggleFavorite(item)} />
        )}
      />
    </Screen>
  )
}

const AnimeCard = ({
  anime,
  onPressFavorite,
}: {
  anime: JikenAnimeItem
  onPressFavorite: () => void
}) => {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const { imageUrl, title, isFavorite } = useAnime(anime)

  const liked = useSharedValue(isFavorite ? 1 : 0)

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
    // TODO navigate to details screen
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
      onLongPress={handlePressFavorite}
      HeadingComponent={<AutoImage source={{ uri: imageUrl }} style={themed($itemImage)} />}
      content={title}
      FooterComponent={
        <Button
          onPress={handlePressFavorite}
          onLongPress={handlePressFavorite}
          style={themed([$favoriteButton, isFavorite && $unFavoriteButton])}
          accessibilityLabel={
            isFavorite
              ? translate("demoPodcastListScreen:accessibility.unfavoriteIcon")
              : translate("demoPodcastListScreen:accessibility.favoriteIcon")
          }
          LeftAccessory={ButtonLeftAccessory}
        >
          <Text
            size="xxs"
            weight="medium"
            text={
              isFavorite
                ? translate("demoPodcastListScreen:unfavoriteButton")
                : translate("demoPodcastListScreen:favoriteButton")
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
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg + spacing.xl,
  paddingBottom: spacing.lg,
})

const $heading: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $emptyState: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xxl,
})

const $emptyStateImage: ImageStyle = {
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}

const $toggle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
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
