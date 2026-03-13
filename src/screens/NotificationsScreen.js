import { FlatList, StyleSheet, Text, View } from "react-native";
import NotificationItem from "../components/NotificationItem";
import { useAppTheme } from "../theme/theme";

export default function NotificationsScreen({ notifications, onPressItem }) {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <NotificationItem
          title={item.title}
          message={item.message}
          time={item.time}
          isRead={item.isRead}
          onPress={() => onPressItem(item)}
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={<Text style={styles.title}>Notifications</Text>}
      ListEmptyComponent={
        <View style={styles.emptyWrap}>
          <Text style={styles.empty}>No notifications yet.</Text>
        </View>
      }
    />
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
  listContent: {
    padding: 16,
    backgroundColor: colors.background,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 12,
  },
  emptyWrap: {
    marginTop: 20,
    alignItems: "center",
  },
  empty: {
    fontSize: 14,
    color: colors.textSubtle,
  },
  });
