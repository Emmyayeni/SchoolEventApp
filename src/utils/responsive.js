import { Dimensions, PixelRatio } from "react-native";

const { width: W, height: H } = Dimensions.get("window");

// Reference width (iPhone 14 Pro / Pixel 7)
const BASE = 390;

/**
 * Scale a size relative to screen width.
 * On a 390px device: scale(n) === n
 * On a 320px device: scale(n) ≈ 0.82 * n
 */
export const scale = (size) =>
  Math.round(PixelRatio.roundToNearestPixel((W / BASE) * size));

/**
 * Moderate scale – fonts scale less aggressively than layout dimensions.
 * factor 0 = no scaling, 1 = full scaling. Default 0.45.
 */
export const ms = (size, factor = 0.45) =>
  Math.round(size + (scale(size) - size) * factor);

/** Width as a percentage of screen width */
export const wp = (pct) => (W * pct) / 100;

/** Height as a percentage of screen height */
export const hp = (pct) => (H * pct) / 100;

export const SCREEN_WIDTH = W;
export const SCREEN_HEIGHT = H;
