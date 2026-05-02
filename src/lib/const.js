const rankList = [
  { name: "unranked", value: "unranked", img: "/assets/img/rank/rank-unranked.png" },
  { name: "iron", value: "iron", img: "/assets/img/rank/rank-iron.png" },
  { name: "bronze", value: "bronze", img: "/assets/img/rank/rank-bronze.png" },
  { name: "silver", value: "silver", img: "/assets/img/rank/rank-silver.png" },
  { name: "gold", value: "gold", img: "/assets/img/rank/rank-gold.png" },
  { name: "platinum", value: "platinum", img: "/assets/img/rank/rank-platinum.png" },
  { name: "emerald", value: "emerald", img: "/assets/img/rank/rank-emerald.png" },
  { name: "diamond", value: "diamond", img: "/assets/img/rank/rank-diamond.png" },
  { name: "master", value: "master", img: "/assets/img/rank/rank-master.png" },
  { name: "grandmaster", value: "grandmaster", img: "/assets/img/rank/rank-grandmaster.png" },
  { name: "challanger", value: "challanger", img: "/assets/img/rank/rank-challanger.png" },
];

const posList = [
  { name: "Top", value: "top", img: "/assets/img/pos/top.svg" },
  { name: "Jungler", value: "jg", img: "/assets/img/pos/jg.svg" },
  { name: "Mid", value: "mid", img: "/assets/img/pos/mid.svg" },
  { name: "ADC", value: "adc", img: "/assets/img/pos/adc.svg" },
  { name: "Support", value: "sp", img: "/assets/img/pos/sp.svg" },
];

export const DRAFT_LIMITS = {
  TEAM_NAME_MAX: 64,
  DRAFT_NAME_MAX: 128,
  GAMES_MAX: 7,
  SLOTS_PER_SIDE: 5,
};

export const CANVAS = {
  WIDTH: 1920,
  HEIGHT: 1080,
  SCALE: 2,
  BG_COLOR: "#020617",
};

export const DEBOUNCE_MS = {
  SEARCH: 200,
};

export const CHAMPION_FIELD_LIMITS = {
  ID: 64,
  KEY: 8,
  NAME: 64,
  TITLE: 128,
  IMAGE_URL: 128,
};

export { posList, rankList };
