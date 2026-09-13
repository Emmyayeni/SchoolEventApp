import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { scale } from "../utils/responsive";

// App-wide screen scaffold. Owns the top safe-area inset (the App shell's
// SafeAreaView already covers bottom/left/right), the background color, and an
// optional scroll container with pull-to-refresh. `header`/`footer` render
// outside the horizontal padding so they can be full-bleed; body content gets
// the standard 16px gutter when `padded`.
export function Screen({
  children,
  header = null,
  footer = null,
  scroll = false,
  padded = true,
  refreshing = false,
  onRefresh,
  edges = ["top"],
  contentContainerStyle,
  style,
  keyboardShouldPersistTaps = "handled",
}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const padTop = edges.includes("top") ? insets.top : 0;
  const padBottom = edges.includes("bottom") ? insets.bottom : 0;
  const horizontal = padded ? { paddingHorizontal: scale(16) } : null;

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[horizontal, { paddingBottom: scale(24) + padBottom }, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, horizontal, { paddingBottom: padBottom }, contentContainerStyle]}>{children}</View>
  );

  return (
    <View style={[styles.flex, { backgroundColor: colors.background, paddingTop: padTop }, style]}>
      {header}
      {body}
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
