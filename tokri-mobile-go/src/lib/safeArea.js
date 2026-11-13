import { useSafeAreaInsets } from 'react-native-safe-area-context'

/**
 * Live bottom system inset from react-native-safe-area-context.
 *
 * Use this for footers, sheets, and screens that draw edge-to-edge when the
 * React Navigation bottom tab bar is hidden or not present.
 *
 * Do NOT apply this again on the built-in bottom tab bar — BottomTabBar already
 * sets height to (UIKit tab height + insets.bottom) and paddingBottom to
 * insets.bottom. Manual height / paddingBottom there causes device-dependent
 * gaps and overlap (gesture vs 3-button nav, iOS home indicator, Android 15+).
 */
export function useSystemBottomInset() {
  return useSafeAreaInsets().bottom
}
