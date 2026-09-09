export type WithSetState<T> = T & {
  setState: (newState: Partial<T>) => void;
};
