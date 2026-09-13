import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { AppText } from "../components/AppText";
import { Field } from "../components/Field";
import CustomButton from "../components/CustomButton";
import { useAppTheme } from "../theme/theme";

export default function ChangePasswordScreen({ onDone, onBack }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const save = async () => {
    if (busy) return;
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirmation) return setError("Passwords do not match.");
    setBusy(true);
    setError("");
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setPassword(""); setConfirmation(""); setSaved(true);
    } catch (err) { setError(err.message || "Could not change your password."); }
    finally { setBusy(false); }
  };
  return <ScrollView keyboardShouldPersistTaps="handled" style={{ backgroundColor: colors.background }} contentContainerStyle={{ flexGrow: 1, padding: 24, paddingTop: insets.top + 24 }}>
    <AppText variant="h1">{saved ? "Password updated" : "Change password"}</AppText>
    <AppText style={{ color: colors.textMuted, marginVertical: 16 }}>{saved ? "Use your new password the next time you sign in." : "Choose a new password for your NSUK Events account."}</AppText>
    {saved ? <CustomButton title="Continue" onPress={onDone} /> : <View style={{ gap: 12 }}>
      <Field label="New password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete="new-password" />
      <Field label="Confirm password" value={confirmation} onChangeText={setConfirmation} secureTextEntry autoCapitalize="none" />
      {!!error && <AppText accessibilityRole="alert" style={{ color: colors.error }}>{error}</AppText>}
      <CustomButton title="Update password" loading={busy} onPress={save} />
      <CustomButton title="Cancel" variant="secondary" disabled={busy} onPress={onBack} />
    </View>}
  </ScrollView>;
}
