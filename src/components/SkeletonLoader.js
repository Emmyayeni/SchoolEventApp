import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useAppTheme } from "../theme/theme";

export function SkeletonLoader({ width, height, borderRadius = 8, style }) {
  const { isDark } = useAppTheme();
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const backgroundColor = isDark ? "#374151" : "#e5e7eb";

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}

export function EventSkeletonCard() {
  const { colors } = useAppTheme();
  
  return (
    <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}>
      <SkeletonLoader width="100%" height={160} borderRadius={16} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <SkeletonLoader width={80} height={24} borderRadius={12} />
          <SkeletonLoader width={32} height={32} borderRadius={16} />
        </View>
        <SkeletonLoader width="80%" height={24} borderRadius={4} style={{ marginTop: 12, marginBottom: 8 }} />
        <SkeletonLoader width="60%" height={16} borderRadius={4} style={{ marginBottom: 16 }} />
        <View style={styles.bottomRow}>
          <SkeletonLoader width="40%" height={16} borderRadius={4} />
          <SkeletonLoader width="30%" height={16} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  content: {
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
});
