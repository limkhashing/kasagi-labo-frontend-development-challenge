import { ComponentType, useCallback, useMemo } from "react"
import { ImageStyle, StyleSheet, View, ViewStyle } from "react-native"
import { useNavigation } from "@react-navigation/native"
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
import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { useAnimeDetails } from "@/context/AnimeContext"
import { translate } from "@/i18n/translate"
import { AnimeDetails } from "@/screens/DetailsScreen"
import type { JikanAnimeItem } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"

export function AnimeCard({
  animeItem,
  showFavoriteButton = true,
  onPressFavorite,
}: {
  animeItem: JikanAnimeItem
  showFavoriteButton?: boolean
  onPressFavorite?: () => void
}) {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const { imageUrl, title, isFavourite, dateAired, duration, synopsis, genres } =
    useAnimeDetails(animeItem)
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
    if (!onPressFavorite) return
    onPressFavorite()
    liked.value = withSpring(liked.value ? 0 : 1)
  }, [liked, onPressFavorite])

  const navigateToDetailsScreen = () => {
    const animeDetails: AnimeDetails = {
      imageUrl,
      title,
      dateAired,
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
        showFavoriteButton ? (
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
        ) : undefined
      }
    />
  )
}

const ICON_SIZE = 14

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
