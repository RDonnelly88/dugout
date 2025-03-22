
// Formation configurations for different team sizes
export const formationConfigs: Record<string, { rows: number[], name: string }> = {
  '1': { rows: [1], name: "1-0-0" },
  '2': { rows: [1, 1], name: "1-1-0" },
  '3': { rows: [1, 2], name: "1-2-0" },
  '4': { rows: [1, 2, 1], name: "1-2-1" },
  '5': { rows: [1, 3, 1], name: "1-3-1" },
  '6': { rows: [1, 3, 2], name: "1-3-2" },
  '7': { rows: [1, 3, 3], name: "1-3-3" },
  '8': { rows: [1, 3, 4], name: "1-3-4" },
  '9': { rows: [1, 4, 4], name: "1-4-4" },
  '10': { rows: [1, 4, 5], name: "1-4-5" },
  '11': { rows: [1, 4, 6], name: "1-4-6" }
};
