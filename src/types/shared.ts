export type BasicItemInfo = {
  id: number;
  type?: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  status?: string;
};

export const checkStatus = ["complete", "active"];
export const errorStatus = ["error", "inactive"];
export const progressStatus = ["generating", "training"];
