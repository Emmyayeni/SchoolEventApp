import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import CustomButton from "../components/CustomButton";
import { useAppTheme } from "../theme/theme";
import { ms, scale,hp } from "../utils/responsive";

export default function EditProfileScreen({ values, onChange, onSave, onBack }) {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  const handleSave = () => {
    onSave();
    Alert.alert("Success", "Profile updated successfully");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <TextInput
        value={values.fullName}
        onChangeText={(value) => onChange("fullName", value)}
        placeholder="Full name"
        style={styles.input}
      />
      <TextInput
        value={values.department}
        onChangeText={(value) => onChange("department", value)}
        placeholder="Department"
        style={styles.input}
      />
      <TextInput
        value={values.level}
        onChangeText={(value) => onChange("level", value)}
        placeholder="Level"
        style={styles.input}
      />
      <TextInput
        value={values.avatar}
        onChangeText={(value) => onChange("avatar", value)}
        placeholder="Avatar URL"
        style={styles.input}
      />

      <View style={styles.buttonRow}>
        <View style={styles.flexButton}>
          <CustomButton title="Save" onPress={handleSave} />
        </View>
        <View style={styles.flexButton}>
          <CustomButton title="Back" onPress={onBack} variant="outline" />
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: scale(16),
    justifyContent: "center",
  },
  title: {
    fontSize: ms(20),
    fontWeight: "800",
    color: colors.text,
    marginBottom: scale(16),
  },
  input: {
    height: scale(46),
    borderRadius: scale(11),
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: scale(12),
    marginBottom: scale(10),
  },
  buttonRow: {
    flexDirection: "row",
    gap: scale(10),
    marginTop: scale(4),
  },
  flexButton: {
    flex: 1,
  },
  });
