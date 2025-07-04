import { FC } from "react"
import { ScrollView, View, ViewStyle } from "react-native"
import { RouteProp, useRoute } from "@react-navigation/native"

import { AutoImage } from "@/components/AutoImage"
import { EmptyState } from "@/components/EmptyState"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { AppStackParamList, AppStackScreenProps } from "@/navigators/AppNavigator"
import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

interface DetailsScreenProps extends AppStackScreenProps<"Details"> {}

export interface AnimeDetails {
  imageUrl: string
  title: string
  datePublished: string
  duration: string
  synopsis: string
  genres: string
}

export const DetailsScreen: FC<DetailsScreenProps> = function DetailsScreen() {
  const { themed } = useAppTheme()
  const route = useRoute<RouteProp<AppStackParamList, "Details">>()
  const params = route.params
  const animeDetails = params?.anime
  const $topContainerInsets = useSafeAreaInsetsStyle(["top"])
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  if (!animeDetails) {
    return (
      <Screen preset="fixed" contentContainerStyle={$styles.flex1}>
        <EmptyState
          preset="generic"
          style={themed($emptyState)}
          contentTx="detailsScreen:noDetails"
          ImageProps={{ resizeMode: "contain" }}
        />
      </Screen>
    )
  }

  return (
    <ScrollView
      style={themed([scrollViewContainer, $topContainerInsets])}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <AutoImage source={{ uri: animeDetails.imageUrl }} />

        <View style={themed([$bottomContainer, $bottomContainerInsets])}>
          <Text preset="heading" text={animeDetails.title} />
          <Text preset="subheading" text={animeDetails.datePublished} />
          <Text preset="subheading" text={animeDetails.duration} />
          <Text preset="default" text={animeDetails.synopsis} />
          <Text preset="formLabel" text={animeDetails.genres} />
        </View>
      </View>
    </ScrollView>
  )
}

const scrollViewContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginHorizontal: spacing.md,
})

const $bottomContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingHorizontal: spacing.lg,
  justifyContent: "space-around",
  marginBottom: spacing.xxxl,
})

const $emptyState: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xxl,
})
