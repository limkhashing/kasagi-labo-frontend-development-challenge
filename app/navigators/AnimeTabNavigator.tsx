import { TextStyle, ViewStyle } from "react-native"
import { BottomTabScreenProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { CompositeScreenProps } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/Icon"
import { AnimeProvider } from "@/context/AnimeContext"
import { translate } from "@/i18n/translate"
import { DebugScreen } from "@/screens/AnimeTabScreen/DebugScreen"
import { FavouritesScreen } from "@/screens/AnimeTabScreen/FavouritesScreen"
import { HomeScreen } from "@/screens/AnimeTabScreen/HomeScreen"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { AppStackParamList, AppStackScreenProps } from "./AppNavigator"

export type AnimeTabParamList = {
  Home: undefined
  Favourites: undefined
  Debug: undefined
}

/**
 * Helper for automatically generating navigation prop types for each route.
 *
 * More info: https://reactnavigation.org/docs/typescript/#organizing-types
 */
export type AnimeTabScreenProps<T extends keyof AnimeTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<AnimeTabParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>

const Tab = createBottomTabNavigator<AnimeTabParamList>()

/**
 * This is the main navigator for the demo screens with a bottom tab bar.
 * Each tab is a stack navigator with its own set of screens.
 *
 * More info: https://reactnavigation.org/docs/bottom-tab-navigator/
 * @returns {JSX.Element} The rendered `DemoNavigator`.
 */
export function AnimeTabNavigator() {
  const { bottom } = useSafeAreaInsets()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <AnimeProvider>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: themed([$tabBar, { height: bottom + 70 }]),
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.text,
          tabBarLabelStyle: themed($tabBarLabel),
          tabBarItemStyle: themed($tabBarItem),
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: translate("animeNavigatorTab:homeTab"),
            tabBarIcon: ({ focused }) => (
              <Icon icon="home" color={focused ? colors.tint : colors.tintInactive} size={30} />
            ),
          }}
        />

        <Tab.Screen
          name="Favourites"
          component={FavouritesScreen}
          options={{
            tabBarLabel: translate("animeNavigatorTab:favouritesTab"),
            tabBarIcon: ({ focused }) => (
              <Icon icon="heart" color={focused ? colors.tint : colors.tintInactive} size={30} />
            ),
          }}
        />

        {__DEV__ && (
          <Tab.Screen
            name="Debug"
            component={DebugScreen}
            options={{
              tabBarLabel: translate("animeNavigatorTab:debugTab"),
              tabBarIcon: ({ focused }) => (
                <Icon icon="debug" color={focused ? colors.tint : colors.tintInactive} size={30} />
              ),
            }}
          />
        )}
      </Tab.Navigator>
    </AnimeProvider>
  )
}

const $tabBar: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  borderTopColor: colors.transparent,
})

const $tabBarItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingTop: spacing.md,
})

const $tabBarLabel: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
  color: colors.text,
})
