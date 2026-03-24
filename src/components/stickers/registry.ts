import type { StickerTemplate } from "./types";
import { bigNumber } from "./big-number";
import { boldStats } from "./bold-stats";
import { boxed } from "./boxed";
import { routeMap } from "./route-map";
import { circularStamp } from "./circular-stamp";
import { dataGrid } from "./data-grid";
import { postcard } from "./postcard";
import { minimal } from "./minimal";
import { poetic } from "./poetic";
import { split } from "./split";

export const templates: StickerTemplate[] = [
  bigNumber,
  boldStats,
  boxed,
  routeMap,
  circularStamp,
  dataGrid,
  postcard,
  minimal,
  poetic,
  split,
];

export function getTemplate(id: string): StickerTemplate | undefined {
  return templates.find((t) => t.id === id);
}
