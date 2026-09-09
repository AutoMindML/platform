export interface Connection {
  id: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
}

export interface ObjectPosition {
  x: number;
  y: number;
}

export interface TableInstance {
  id: string;
  tableId: string;
  name: string;
  position: ObjectPosition;
  primaryKey: string | null;
  isTarget: boolean;
  columns: Array<{ name: string; type: string; sample: string }>;
}

export type CanvasTransform = {
  scale: number;
} & ObjectPosition;

export type TableCardColumnList = {
  id: string;
  name: string;
  columns: {
    name: string;
    type: string;
    sample: string;
  }[];
  rows: number;
};
