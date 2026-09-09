"use client";

import Manager from "../_containers/manager";

import { useState } from "react";

import { trpc } from "@/server/trpc/client";
import { BasicItemInfo } from "@/types/shared";

export default function MLEngine() {
  const [, setCurrentItem] = useState<BasicItemInfo | undefined>(undefined);
  const engines = trpc.engine.getManyEngines.useQuery();

  return (
    <div>
      <Manager
        isLoading={engines.isLoading}
        isSuccess={engines.isSuccess}
        item={{
          onClick: (v) => {
            setCurrentItem(v);
          },
        }}
        data={engines.data
          ? engines.data.map<BasicItemInfo>((v) => ({
            id: v.oid,
            name: v.name ?? "",
            type: v.engine_type ?? undefined,
            description: v.description ?? "",
            createdAt: v.created_at,
            updatedAt: v.updated_at,
          }))
          : []}
      />
    </div>
  );
}
