const en = {
  common: {
    ok: "OK!",
    cancel: "Cancel",
    back: "Back",
    logOut: "Log Out",
  },
  errorScreen: {
    title: "Something went wrong!",
    friendlySubtitle:
      "This is the screen that your users will see in production when an error is thrown. You'll want to customize this message (located in `app/i18n/en.ts`) and probably the layout as well (`app/screens/ErrorScreen`). If you want to remove this entirely, check `app/app.tsx` for the <ErrorBoundary> component.",
    reset: "RESET APP",
    traceTitle: "Error from %{name} stack",
  },
  emptyStateComponent: {
    generic: {
      heading: "So empty... so sad",
      content: "No data found yet. Try clicking the button to refresh or reload the app.",
      button: "Let's try this again",
    },
  },
  animeNavigatorTab: {
    homeTab: "Home",
    debugTab: "Debug",
  },
  homeTab: {
    onlyFavorites: "Only Show Favorites",
    favoriteButton: "Favorite",
    unfavoriteButton: "Unfavorite",
  },
  detailsScreen: {
    noDetails: "No details available for this anime.",
  },
  noFavoritesEmptyState: {
    heading: "This looks a bit empty",
    content:
      "No favorites have been added yet. Tap the heart on an anime to add it to your favorites!",
  },
}

export default en
export type Translations = typeof en
