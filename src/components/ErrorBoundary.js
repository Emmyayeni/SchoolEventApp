import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "./AppText";
import CustomButton from "./CustomButton";
import { useAppTheme } from "../theme/theme";
import { scale } from "../utils/responsive";

// Themed fallback UI. A function component so it can use useAppTheme() — the
// class below can't use hooks, so it delegates rendering to this.
function ErrorFallback({ onReset }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name="warning-outline" size={44} color={colors.error} />
      </View>
      <AppText variant="h2" style={{ color: colors.text, textAlign: "center", marginBottom: scale(8) }}>
        Something went wrong
      </AppText>
      <AppText variant="body" style={{ color: colors.textMuted, textAlign: "center", marginBottom: scale(24) }}>
        An unexpected error occurred. Please try reloading the app.
      </AppText>
      <CustomButton title="Reload app" onPress={onReset} variant="primary" leftIcon="refresh" fullWidth={false} />
    </View>
  );
}

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scale(32),
  },
  iconWrap: {
    width: scale(88),
    height: scale(88),
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scale(20),
  },
});
