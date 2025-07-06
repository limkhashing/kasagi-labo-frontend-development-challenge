import { useState } from "react"
import { FlatList, Pressable, StyleProp, View, ViewStyle } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export interface DropdownProps<T> {
  options: T[]
  value: number | undefined
  getLabel: (item: T) => string
  getValue: (item: T) => number
  onChange: (value: number | undefined) => void
  placeholder?: string
  style?: StyleProp<ViewStyle>
}

export function Dropdown<T>({
  options,
  value,
  getLabel,
  getValue,
  onChange,
  placeholder = "Select...",
  style,
}: DropdownProps<T>) {
  const { themed } = useAppTheme()
  const [visible, setVisible] = useState(false)

  const selectedOption = options.find((item) => getValue(item) === value)

  return (
    <View style={[$container, style]}>
      <Pressable
        style={themed($dropdown)}
        onPress={() => setVisible((v) => !v)}
        accessibilityRole="button"
      >
        <Text style={themed($dropdownText)}>
          {selectedOption ? getLabel(selectedOption) : placeholder}
        </Text>
      </Pressable>
      {visible && (
        <View style={themed($dropdownList)}>
          <FlatList
            data={options}
            keyExtractor={(item) => String(getValue(item))}
            renderItem={({ item }) => (
              <Pressable
                style={themed($option)}
                onPress={() => {
                  onChange(getValue(item))
                  setVisible(false)
                }}
              >
                <Text style={themed($optionText)}>{getLabel(item)}</Text>
              </Pressable>
            )}
            scrollEnabled={false} // Prevents nested scroll conflict
          />
        </View>
      )}
    </View>
  )
}

const $container: ViewStyle = {
  width: "100%",
  position: "relative",
}

const $dropdown: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  padding: spacing.sm,
  backgroundColor: colors.background,
})

const $dropdownText: ThemedStyle<any> = ({ colors, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.normal,
  fontSize: 16,
})

const $dropdownList: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  backgroundColor: colors.background,
  borderRadius: 10,
  padding: spacing.xs,
  minWidth: 200,
  maxHeight: 300,
  borderWidth: 1,
  borderColor: colors.border,
  zIndex: 100,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 5,
})

const $option: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
})

const $optionText: ThemedStyle<any> = ({ colors, typography }) => ({
  color: colors.text,
  fontFamily: typography.primary.normal,
  fontSize: 16,
})
