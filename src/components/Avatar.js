import { useState } from "react";
import { Image, View } from "react-native";
import { AppText } from "./AppText";
import { useAppTheme } from "../theme/theme";

export function Avatar({ uri, name = "", size = 40, style }) {
  const { colors } = useAppTheme();
  const [failedUri, setFailedUri] = useState("");
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  const frame = [{ width: size, height: size, borderRadius: size / 2 }, style];
  if (uri && failedUri !== uri) return <Image source={{ uri }} style={frame} onError={() => setFailedUri(uri)} accessibilityLabel={name ? `${name}'s photo` : "Profile photo"} />;
  return <View style={[...frame, { backgroundColor: colors.surfaceAlt, alignItems: "center", justifyContent: "center" }]} accessibilityLabel={name || "Profile"}>
    <AppText style={{ color: colors.text, fontSize: Math.max(12, size / 3), fontWeight: "700" }}>{initials || "?"}</AppText>
  </View>;
}
