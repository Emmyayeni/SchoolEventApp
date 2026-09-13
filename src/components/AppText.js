import { Text as RNText, StyleSheet } from "react-native";
import { typography } from "../theme/theme";
import { ms } from "../utils/responsive";

function familyForWeight(weight) {
  const w = String(weight);
  if (w === "900") return "Outfit_900Black";
  if (w === "800") return "Outfit_800ExtraBold";
  if (w === "700" || w === "bold") return "Outfit_700Bold";
  if (w === "600") return "Outfit_600SemiBold";
  if (w === "500") return "Outfit_500Medium";
  if (w === "300") return "Outfit_300Light";
  return "Outfit_400Regular";
}

// App-wide text primitive. Applies the Outfit font family that matches the
// requested fontWeight, and (optionally) a typography `variant` from the theme.
// Any explicit `style` wins over the variant. `maxFontSizeMultiplier` caps OS
// font-scaling so large accessibility text sizes don't break layouts.
export function AppText({ style, variant, maxFontSizeMultiplier = 1.4, ...props }) {
  const variantToken = variant ? typography[variant] : null;
  const variantStyle = variantToken
    ? {
        ...variantToken,
        fontSize: ms(variantToken.fontSize),
        lineHeight: ms(variantToken.lineHeight),
      }
    : null;

  const flatStyle = style ? StyleSheet.flatten(style) : null;
  const effectiveWeight = flatStyle?.fontWeight || variantToken?.fontWeight || "400";
  const fontFamily = familyForWeight(effectiveWeight);

  return (
    <RNText
      style={[{ fontFamily }, variantStyle, style]}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...props}
    />
  );
}
