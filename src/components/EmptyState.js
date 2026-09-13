import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "./AppText";
import CustomButton from "./CustomButton";
import { useAppTheme } from "../theme/theme";
import { scale } from "../utils/responsive";

// "Nothing here yet" state (not a failure — that's ErrorState). Optional CTA.
export function EmptyState({ icon = "folder-open-outline", title, description, actionLabel, onAction }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name={icon} size={44} color={colors.textMuted} />
      </View>
      {!!title && (
        <AppText variant="h3" style={[styles.title, { color: colors.text }]}>
          {title}
        </AppText>
      )}
      {!!description && (
        <AppText variant="body" style={[styles.description, { color: colors.textMuted }]}>
          {description}
        </AppText>
      )}
      {actionLabel && onAction ? (
        <View style={{ marginTop: scale(20) }}>
          <CustomButton title={actionLabel} onPress={onAction} variant="secondary" fullWidth={false} />
        </View>
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
  title: { textAlign: "center", marginBottom: scale(6) },
  description: { textAlign: "center" },
});
