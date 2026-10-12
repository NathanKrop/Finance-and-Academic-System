export type RubricLevel = "EE" | "ME" | "AE" | "BE";
export type RubricSubLevel = "EE1" | "EE2" | "ME1" | "ME2" | "AE1" | "AE2" | "BE1" | "BE2";

export type CbeRubricConfig = {
  ee1: number;
  ee2: number;
  me1: number;
  me2: number;
  ae1: number;
  ae2: number;
  be1: number;
  be2: number;
};

export type RubricResult = {
  level: RubricLevel;
  subLevel: RubricSubLevel;
  label: string;
  descriptor: string;
  score: number;
};

export const DEFAULT_CBE_RUBRIC_CONFIG: CbeRubricConfig = {
  ee1: 90,
  ee2: 85,
  me1: 75,
  me2: 70,
  ae1: 60,
  ae2: 50,
  be1: 40,
  be2: 0,
};

let activeCbeRubricConfig: CbeRubricConfig = { ...DEFAULT_CBE_RUBRIC_CONFIG };

export function setCbeRubricConfig(config: Partial<CbeRubricConfig>) {
  activeCbeRubricConfig = { ...DEFAULT_CBE_RUBRIC_CONFIG, ...config };
}

export function getRubric(score: number): RubricResult {
  const numeric = Number.isFinite(score) ? Math.min(Math.max(score, 0), 100) : 0;

  if (numeric >= activeCbeRubricConfig.ee1) {
    return {
      level: "EE",
      subLevel: "EE2",
      label: "EE2",
      descriptor: "Exceeding Expectation",
      score: numeric,
    };
  }

  if (numeric >= activeCbeRubricConfig.ee2) {
    return {
      level: "EE",
      subLevel: "EE1",
      label: "EE1",
      descriptor: "Exceeding Expectation",
      score: numeric,
    };
  }

  if (numeric >= activeCbeRubricConfig.me1) {
    return {
      level: "ME",
      subLevel: "ME2",
      label: "ME2",
      descriptor: "Meeting Expectation",
      score: numeric,
    };
  }

  if (numeric >= activeCbeRubricConfig.me2) {
    return {
      level: "ME",
      subLevel: "ME1",
      label: "ME1",
      descriptor: "Meeting Expectation",
      score: numeric,
    };
  }

  if (numeric >= activeCbeRubricConfig.ae1) {
    return {
      level: "AE",
      subLevel: "AE2",
      label: "AE2",
      descriptor: "Approaching Expectation",
      score: numeric,
    };
  }

  if (numeric >= activeCbeRubricConfig.ae2) {
    return {
      level: "AE",
      subLevel: "AE1",
      label: "AE1",
      descriptor: "Approaching Expectation",
      score: numeric,
    };
  }

  if (numeric >= activeCbeRubricConfig.be1) {
    return {
      level: "BE",
      subLevel: "BE2",
      label: "BE2",
      descriptor: "Below Expectation",
      score: numeric,
    };
  }

  return {
    level: "BE",
    subLevel: "BE1",
    label: "BE1",
    descriptor: "Below Expectation",
    score: numeric,
  };
}
