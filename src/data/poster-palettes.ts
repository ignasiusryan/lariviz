export interface PosterPalette {
  id: string;
  name: string;
  bg: string;
  mapBg: string;
  mapWater: string;
  mapRoads: string;
  mapRoadsMajor: string;
  mapRoadsMinor: string;
  mapBuildings: string;
  mapLanduse: string;
  routeColor: string;
  routeGlow: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
}

export const palettes: PosterPalette[] = [
  {
    id: "midnight",
    name: "Midnight",
    bg: "#0B1426",
    mapBg: "#0B1426",
    mapWater: "#071020",
    mapRoads: "#162040",
    mapRoadsMajor: "#1c2a50",
    mapRoadsMinor: "#111a35",
    mapBuildings: "#101830",
    mapLanduse: "#0f1830",
    routeColor: "#00D4FF",
    routeGlow: "rgba(0, 212, 255, 0.5)",
    text: "#e0e8f0",
    textMuted: "#5a7090",
    accent: "#00D4FF",
    border: "#253a60",
  },
  {
    id: "ink",
    name: "Ink",
    bg: "#000000",
    mapBg: "#000000",
    mapWater: "#060606",
    mapRoads: "#181818",
    mapRoadsMajor: "#222222",
    mapRoadsMinor: "#121212",
    mapBuildings: "#0c0c0c",
    mapLanduse: "#0a0a0a",
    routeColor: "#FFFFFF",
    routeGlow: "rgba(255, 255, 255, 0.35)",
    text: "#e8e8e8",
    textMuted: "#555555",
    accent: "#FFFFFF",
    border: "#2a2a2a",
  },
  {
    id: "forest",
    name: "Forest",
    bg: "#0A1F0A",
    mapBg: "#0A1F0A",
    mapWater: "#051205",
    mapRoads: "#163016",
    mapRoadsMajor: "#1c3e1c",
    mapRoadsMinor: "#112811",
    mapBuildings: "#102510",
    mapLanduse: "#102510",
    routeColor: "#4ADE80",
    routeGlow: "rgba(74, 222, 128, 0.4)",
    text: "#d0e8d0",
    textMuted: "#4a7a4a",
    accent: "#4ADE80",
    border: "#255025",
  },
  {
    id: "ember",
    name: "Ember",
    bg: "#1A1A1A",
    mapBg: "#1A1A1A",
    mapWater: "#111111",
    mapRoads: "#282828",
    mapRoadsMajor: "#303030",
    mapRoadsMinor: "#222222",
    mapBuildings: "#1e1e1e",
    mapLanduse: "#202020",
    routeColor: "#FF6B35",
    routeGlow: "rgba(255, 107, 53, 0.4)",
    text: "#f0e8e0",
    textMuted: "#6a5a4a",
    accent: "#FF6B35",
    border: "#3a3a3a",
  },
  {
    id: "paper",
    name: "Paper",
    bg: "#F5F0EB",
    mapBg: "#F5F0EB",
    mapWater: "#e5dfd6",
    mapRoads: "#d0c8bc",
    mapRoadsMajor: "#c5bdb0",
    mapRoadsMinor: "#d8d2c8",
    mapBuildings: "#e0dad0",
    mapLanduse: "#e5dfd6",
    routeColor: "#1B2A4A",
    routeGlow: "rgba(27, 42, 74, 0.3)",
    text: "#1a1a1a",
    textMuted: "#8a8078",
    accent: "#1B2A4A",
    border: "#b0a898",
  },
  {
    id: "gold",
    name: "Gold",
    bg: "#0e1528",
    mapBg: "#0e1528",
    mapWater: "#0a1020",
    mapRoads: "#1c1a18",
    mapRoadsMajor: "#2a2520",
    mapRoadsMinor: "#161412",
    mapBuildings: "#141820",
    mapLanduse: "#141a30",
    routeColor: "#D4A843",
    routeGlow: "rgba(212, 168, 67, 0.45)",
    text: "#D4A843",
    textMuted: "#6a5a30",
    accent: "#D4A843",
    border: "#3a3420",
  },
];

export function getPalette(id: string): PosterPalette {
  return palettes.find((p) => p.id === id) || palettes[0];
}
