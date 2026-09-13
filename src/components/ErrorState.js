import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "./AppText";
import CustomButton from "./CustomButton";
import { useAppTheme } from "../theme/theme";
import { scale } from "../utils/responsive";

// Data/network failure state: icon + message + optional Retry button.
// Sibling to EmptyState (which is for "nothing here yet", not failures).
export function ErrorState({
  icon = "cloud-offline-outline",
  title = "Something went wrong",
  description = "We couldn't load this. Check your connection and try again.",
  actionLabel = "Try again",
  onRetry,
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name={icon} size={44} color={colors.textMuted} />
      </View>
      <AppText variant="h3" style={{ color: colors.text, textAlign: "center", marginBottom: scale(6) }}>
        {title}
      </AppText>
      <AppText variant="body" style={{ color: colors.textMuted, textAlign: "center", marginBottom: scale(20) }}>
        {description}
      </AppText>
      {onRetry ? (
        <CustomButton
          title={actionLabel}
          onPress={onRetry}
          variant="secondary"
          leftIcon="refresh"
          fullWidth={false}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scale(32),
    marginTop: scale(40),
  },
  iconWrap: {
    width: scale(88),
    height: scale(88),
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scale(20),
  },
});
