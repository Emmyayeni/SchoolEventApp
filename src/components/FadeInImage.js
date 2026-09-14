import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Animated, StyleSheet, View } from "react-native";
import { useAppTheme } from "../theme/theme";

export function FadeInImage({ source, style, resizeMode = "cover", ...props }) {
  const { colors } = useAppTheme();
  const [opacityAnim] = useState(new Animated.Value(0));
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); opacityAnim.setValue(0); }, [source?.uri, opacityAnim]);

  const handleLoad = () => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={[styles.container, style, { backgroundColor: colors.surfaceAlt }]}>
      {failed || !source || (typeof source === "object" && !source.uri) ? <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><Ionicons name="image-outline" size={30} color={colors.textSubtle} /></View> : <Animated.Image
        source={source}
        style={[styles.image, { opacity: opacityAnim }]}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onError={() => setFailed(true)}
        {...props}
      />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
