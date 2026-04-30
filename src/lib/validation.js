import { DRAFT_LIMITS } from "@/lib/const";

export const isValidChamp = (c) =>
  c === null ||
  (typeof c === "object" &&
    !Array.isArray(c) &&
    typeof c.id === "string" && c.id.length <= 64 &&
    typeof c.key === "string" && c.key.length <= 8);

export const isValidGame = (g) =>
  g &&
  typeof g === "object" &&
  !Array.isArray(g) &&
  Array.isArray(g.blueBan) && g.blueBan.length === 5 && g.blueBan.every(isValidChamp) &&
  Array.isArray(g.redBan)  && g.redBan.length  === 5 && g.redBan.every(isValidChamp)  &&
  Array.isArray(g.blue)    && g.blue.length    === 5 && g.blue.every(isValidChamp)    &&
  Array.isArray(g.red)     && g.red.length     === 5 && g.red.every(isValidChamp)     &&
  (g.swapped === undefined || typeof g.swapped === "boolean");

export const validateDraftData = (dd) =>
  dd &&
  typeof dd === "object" &&
  !Array.isArray(dd) &&
  (dd.games === undefined || (
    Array.isArray(dd.games) &&
    dd.games.length <= DRAFT_LIMITS.GAMES_MAX &&
    dd.games.every(isValidGame)
  ));

export const sanitizeFilename = (s) =>
  s.replace(/[^a-zA-Z0-9_\-]/g, "_").slice(0, DRAFT_LIMITS.TEAM_NAME_MAX);
