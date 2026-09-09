export type DatasetBasicInfo = {
  rows: number;
  cols: number;
  size: number;
  size_unit: string;
};

export type DatasetTable<T = unknown> = Record<string, T>[];
