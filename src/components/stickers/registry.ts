import type { InsightTemplate } from "./types";
import { topGears } from "./top-gears";
import { cityStamps } from "./city-stamps";
import { streakCounter } from "./streak-counter";
import { yearOverYear } from "./year-over-year";
import { temperatureRanger } from "./temperature-ranger";
import { milestoneUnlocked } from "./milestone-unlocked";
import { raceRecap } from "./race-recap";
import { monthlyWrap } from "./monthly-wrap";
import { weeklySummary } from "./weekly-summary";
import { distanceMilestone } from "./distance-milestone";
import { runComparison } from "./run-comparison";

export const templates: InsightTemplate[] = [
  topGears,
  cityStamps,
  streakCounter,
  yearOverYear,
  temperatureRanger,
  milestoneUnlocked,
  weeklySummary,
];

// Larger format templates (1080x1080 and 1080x1920) — not in the 540px sticker gallery
export const largeTemplates: InsightTemplate[] = [
  raceRecap,
  monthlyWrap,
  distanceMilestone,
  runComparison,
];

export function getTemplate(id: string): InsightTemplate | undefined {
  return [...templates, ...largeTemplates].find((t) => t.id === id);
}
