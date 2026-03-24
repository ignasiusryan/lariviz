import type { Activity } from "../Dashboard";

export interface StickerConfig {
  activity: Activity;
  theme: "dark" | "clear";
  customText?: string;
  // Pre-computed values
  distanceKm: string;
  pace: string;
  duration: string;
  date: string;
  dayOfWeek: string;
  location: string;
  routePoints: [number, number][];
}

export interface StickerTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  hasCustomText: boolean;
  defaultText?: string;
  textPlaceholder?: string;
  render: (ctx: CanvasRenderingContext2D, config: StickerConfig) => void;
}
