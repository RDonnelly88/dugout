
// Formation configurations for different team sizes
export const formationConfigs: Record<string, { rows: number[], name: string }> = {
  '1': { rows: [1], name: "1-0-0" },
  '2': { rows: [1, 1], name: "1-1-0" },
  '3': { rows: [1, 2], name: "1-2-0" },
  '4': { rows: [1, 2, 1], name: "1-2-1" },
  '5': { rows: [1, 3, 1], name: "1-3-1" },
  '6': { rows: [2, 3, 1], name: "2-3-1" },
  '7': { rows: [3, 3, 1], name: "3-3-1" },
  '8': { rows: [3, 3, 2], name: "3-3-2" },
  '9': { rows: [3, 4, 2], name: "3-4-2" },
  '10': { rows: [4, 4, 2], name: "4-4-2" },
  '11': { rows: [4, 4, 3], name: "4-4-3" }
};
