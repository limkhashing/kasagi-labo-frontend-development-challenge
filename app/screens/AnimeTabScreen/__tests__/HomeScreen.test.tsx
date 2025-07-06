import { fireEvent, render, waitFor } from "@testing-library/react-native"

import { useAnimeList } from "@/context/AnimeContext"
import { HomeScreen } from "@/screens/AnimeTabScreen/HomeScreen"
import { useAppTheme } from "@/theme/context"
import { delay } from "@/utils/delay"

jest.mock("@/context/AnimeContext", () => ({
  useAnimeList: jest.fn(),
}))
jest.mock("@/theme/context", () => ({
  useAppTheme: jest.fn(),
}))
jest.mock("@/utils/delay", () => ({
  delay: jest.fn(() => Promise.resolve()),
}))
jest.mock("@/components/ListView", () => ({
  ListView: ({
    ListHeaderComponent,
    onRefresh,
    onEndReached,
    data,
    renderItem,
    ListEmptyComponent,
  }) => (
    <>
      {ListHeaderComponent}
      <button testID="refresh-button" onPress={onRefresh}>
        Refresh
      </button>
      <button testID="load-more" onPress={onEndReached}>
        Load More
      </button>
      {data.length === 0
        ? ListEmptyComponent
        : data.map((item) => <div key={item.mal_id}>{renderItem({ item })}</div>)}
    </>
  ),
}))
jest.mock("@/components/Screen", () => ({
  Screen: ({ children }) => <>{children}</>,
}))
jest.mock("@/components/Text", () => ({
  Text: ({ tx, children }) => <div>{tx || children}</div>,
}))
jest.mock("@/components/Toggle/Checkbox", () => ({
  Checkbox: ({ value, onValueChange }) => (
    <input type="checkbox" checked={value} onChange={onValueChange} testID="genre-checkbox" />
  ),
}))
jest.mock("@/screens/AnimeTabScreen/AnimeCard", () => ({
  AnimeCard: ({ animeItem, onPressFavorite }) => (
    <div testID={`anime-card-${animeItem.mal_id}`}>
      {animeItem.title}
      <button testID={`favorite-button-${animeItem.mal_id}`} onPress={onPressFavorite}>
        Favorite
      </button>
    </div>
  ),
}))
jest.mock("@/components/EmptyState", () => ({
  EmptyState: ({ headingTx, contentTx, buttonOnPress }) => (
    <div testID="empty-state">
      <div>{headingTx}</div>
      <div>{contentTx}</div>
      <button testID="empty-state-button" onPress={buttonOnPress}>
        Retry
      </button>
    </div>
  ),
}))

describe("HomeScreen", () => {
  const mockAnimeList = [
    {
      mal_id: 1,
      title: "Anime 1",
      images: {},
      aired: { from: "" },
      genres: [
        { mal_id: 1, name: "Action" },
        { mal_id: 8, name: "Comedy" },
      ],
    },
    {
      mal_id: 2,
      title: "Anime 2",
      images: {},
      aired: { from: "" },
      genres: [
        { mal_id: 8, name: "Comedy" },
        { mal_id: 46, name: "Award Winning" },
      ],
    },
  ]
  const mockFetchAnimeList = jest.fn().mockResolvedValue(false)
  const mockToggleFavouriteStatus = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useAnimeList.mockReturnValue({
      animeForList: mockAnimeList,
      fetchAnimeList: mockFetchAnimeList,
      toggleFavouriteStatus: mockToggleFavouriteStatus,
    })
    useAppTheme.mockReturnValue({
      themed: jest.fn((style) => style),
    })
  })

  it("Should renders anime cards", async () => {
    const { getByTestId } = render(<HomeScreen navigation={{}} route={{}} />)
    await waitFor(() => {
      expect(getByTestId("anime-card-1")).toBeTruthy()
      expect(getByTestId("anime-card-2")).toBeTruthy()
    })
  })

  it("Should calls fetchAnimeList on mount", async () => {
    render(<HomeScreen navigation={{}} route={{}} />)
    await waitFor(() => {
      expect(mockFetchAnimeList).toHaveBeenCalledWith(1, undefined, [])
    })
  })

  it("Should shows empty state when animeForList is empty", async () => {
    useAnimeList.mockReturnValue({
      animeForList: [],
      fetchAnimeList: mockFetchAnimeList,
      toggleFavouriteStatus: mockToggleFavouriteStatus,
    })
    const { getByTestId } = render(<HomeScreen navigation={{}} route={{}} />)
    await waitFor(() => {
      expect(getByTestId("empty-state")).toBeTruthy()
    })
  })

  it("Should refreshes on press refresh button for empty state", async () => {
    const { getByTestId } = render(<HomeScreen navigation={{}} route={{}} />)
    mockFetchAnimeList.mockClear()
    fireEvent.press(getByTestId("refresh-button"))
    await waitFor(() => {
      expect(mockFetchAnimeList).toHaveBeenCalledWith(1, undefined, [])
      expect(delay).toHaveBeenCalledWith(750)
    })
  })

  it("Should updates selected genres when a genre checkbox is toggled", async () => {
    mockFetchAnimeList.mockClear()

    const { getAllByTestId } = render(<HomeScreen navigation={{}} route={{}} />)

    await waitFor(() => {
      const checkboxes = getAllByTestId("genre-checkbox")
      checkboxes[0].props.onChange({ target: { checked: true } })
      expect(mockFetchAnimeList).toHaveBeenCalledWith(1, undefined, [1])
    })
  })

  it("Should call toggleFavouriteStatus when favorite button is pressed", async () => {
    const { getByTestId } = render(<HomeScreen navigation={{}} route={{}} />)

    await waitFor(() => {
      fireEvent.press(getByTestId("favorite-button-1"))
      expect(mockToggleFavouriteStatus).toHaveBeenCalledWith(
        expect.objectContaining({ mal_id: 1, title: "Anime 1" }),
      )
      fireEvent.press(getByTestId("favorite-button-2"))
      expect(mockToggleFavouriteStatus).toHaveBeenCalledWith(
        expect.objectContaining({ mal_id: 2, title: "Anime 2" }),
      )
    })
  })

  it("Should call toggleFavouriteStatus again when unfavoriting an anime card", async () => {
    const { getByTestId } = render(<HomeScreen navigation={{}} route={{}} />)

    await waitFor(() => {
      // Favorite
      fireEvent.press(getByTestId("favorite-button-1"))
      expect(mockToggleFavouriteStatus).toHaveBeenCalledWith(
        expect.objectContaining({ mal_id: 1, title: "Anime 1" }),
      )

      // Unfavorite (simulate toggling)
      fireEvent.press(getByTestId("favorite-button-1"))
      expect(mockToggleFavouriteStatus).toHaveBeenCalledTimes(2)
      expect(mockToggleFavouriteStatus).toHaveBeenLastCalledWith(
        expect.objectContaining({ mal_id: 1, title: "Anime 1" }),
      )
    })
  })
})
