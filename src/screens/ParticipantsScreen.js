import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { AppText } from "../components/AppText";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { fetchEventParticipants } from "../services/supabaseData";
import { useAppTheme } from "../theme/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ParticipantsScreen({ event, onBack }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setRows(await fetchEventParticipants(event.id)); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [event.id]);
  useEffect(() => {
    const task = setTimeout(load, 0);
    return () => clearTimeout(task);
  }, [load]);
  return <View style={{ flex: 1, paddingTop: insets.top + 12, backgroundColor: colors.background }}>
    <View style={{ paddingHorizontal: 20, gap: 8, paddingBottom: 20 }}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to event"><AppText style={{ color: colors.primary }}>← Back to event</AppText></Pressable>
      <AppText variant="h1">Participants</AppText>
      <AppText>{event.title}</AppText>
      <AppText style={{ color: colors.textMuted }}>{rows.filter(row => row.status === "registered").length} registered · {rows.filter(row => row.status === "waitlisted").length} waitlisted</AppText>
    </View>
    {error ? <ErrorState description={error} onRetry={load} /> : <FlatList
      data={rows} keyExtractor={row => row.id} refreshing={loading} onRefresh={load}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
      ListEmptyComponent={loading ? <ActivityIndicator color={colors.primary} /> : <EmptyState title="No participants yet" description="RSVPs will appear here when users register." icon="people-outline" />}
      renderItem={({ item }) => <View style={{ padding: 16, marginBottom: 10, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSoft }}>
        <AppText variant="h3">{item.profile?.full_name || "Campus participant"}</AppText>
        <AppText style={{ color: colors.textMuted }}>{[item.profile?.department, item.profile?.matric_number].filter(Boolean).join(" · ")}</AppText>
        <AppText style={{ color: item.status === "waitlisted" ? colors.warning : colors.primary }}>{item.status === "waitlisted" ? "Waitlisted" : "Registered"}</AppText>
      </View>}
    />}
  </View>;
}
