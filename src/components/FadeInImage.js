import React, { useState } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";
import { useAppTheme } from "../theme/theme";

export function FadeInImage({ source, style, resizeMode = "cover", ...props }) {
  const { colors } = useAppTheme();
  const [opacityAnim] = useState(new Animated.Value(0));

  const handleLoad = () => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={[styles.container, style, { backgroundColor: colors.surfaceAlt }]}>
      <Animated.Image
        source={source}
        style={[styles.image, { opacity: opacityAnim }]}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        {...props}
      />
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
