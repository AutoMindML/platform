import { useTranslation } from "./client";

import { useParams } from "next/navigation";

export const useLngNs = (ns: string) => {
  const p = useParams();
  const { t } = useTranslation(p.lng as string, ns);

  return t;
};
