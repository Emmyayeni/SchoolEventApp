import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/theme";
import CustomButton from "./CustomButton";

export default function EventCard({
  id,
  title,
  image,
  date,
  time,
  venue,
  category,
  description,
  onPress,
}) {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  return (
    <Pressable style={styles.card} onPress={() => onPress(id)}>
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.category}>{category}</Text>
        </View>
        {!!description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}
        <Text style={styles.meta}>{date}</Text>
        <Text style={styles.meta}>{time}</Text>
        <Text style={styles.meta}>{venue}</Text>
        <CustomButton title="View Details" onPress={() => onPress(id)} />
      </View>
    </Pressable>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: colors.surface,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginBottom: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrap: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  body: {
    padding: 12,
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  category: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  description: {
    fontSize: 13,
    color: colors.textSubtle,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  });
