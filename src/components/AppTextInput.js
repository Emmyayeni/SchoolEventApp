import React from "react";
import { TextInput as RNTextInput } from "react-native";

// Applies the app's default Outfit font to text inputs. Any fontFamily passed via
// `style` still wins because it is spread after the default. In React 19 a `ref`
// arrives as a normal prop, so spreading {...props} forwards it to the native input.
export function AppTextInput({ style, ...props }) {
  return (
    <RNTextInput
      style={[{ fontFamily: "Outfit_400Regular" }, style]}
      {...props}
    />
  );
}
