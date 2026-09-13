import { useMemo } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "../components/AppText";
import CustomButton from "../components/CustomButton";
import { useAppTheme } from "../theme/theme";

export default function AdminSettingsScreen({ onBack, onEditProfile, onChangePassword, onLogout }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const card = useMemo(() => ({ padding: 18, gap: 12, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSoft }), [colors]);
  return <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, gap: 20 }}>
    <CustomButton title="Back to dashboard" variant="secondary" onPress={onBack} />
    <AppText variant="h1">Admin Settings</AppText>
    <View style={card}>
      <AppText variant="h3">Your account</AppText>
      <CustomButton title="Edit profile" variant="secondary" onPress={onEditProfile} />
      <CustomButton title="Change password" variant="secondary" onPress={onChangePassword} />
    </View>
    <View style={card}>
      <AppText variant="h3">Publishing rules</AppText>
      <AppText>Staff and organizer accounts require approval before they can publish events. Event descriptions are required.</AppText>
      <AppText>Use Manage Users to approve new organizers or disable access. Use Manage Events to review campus activities.</AppText>
    </View>
    <View style={card}>
      <AppText variant="h3">NSUK Events</AppText>
      <AppText style={{ color: colors.textMuted }}>Version 1.0.0 · Campus event information system</AppText>
    </View>
    <CustomButton title="Log out" variant="secondary" onPress={() => Alert.alert("Log out", "End this session?", [{ text: "Cancel", style: "cancel" }, { text: "Log out", onPress: onLogout }])} />
  </ScrollView>;
}
