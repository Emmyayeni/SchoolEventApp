import React from "react";
import { Text as RNText, StyleSheet } from "react-native";

export function AppText({ style, ...props }) {
  // Try to determine font weight from style to use the correct Outfit font family
  let fontFamily = "Outfit_400Regular";
  
  if (style) {
    const flatStyle = StyleSheet.flatten(style);
    if (flatStyle.fontWeight) {
      const weight = String(flatStyle.fontWeight);
      if (weight === "900" || weight === "bold") fontFamily = "Outfit_900Black";
      else if (weight === "800") fontFamily = "Outfit_800ExtraBold";
      else if (weight === "700") fontFamily = "Outfit_700Bold";
      else if (weight === "600") fontFamily = "Outfit_600SemiBold";
      else if (weight === "500") fontFamily = "Outfit_500Medium";
      else if (weight === "300") fontFamily = "Outfit_300Light";
    }
  }

  return (
    <RNText 
      style={[{ fontFamily }, style]} 
      {...props} 
    />
  );
}
