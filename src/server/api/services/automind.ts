import { MutationResponseResult } from "../schemas/i3s";

import { env } from "@/env.mjs";
import { TRPCContextWithSession } from "@/server/trpc/procedure";
import { HTTP_METHOD } from "@/types/web/http";
import { csvStr2Array } from "@/utils/transformer/csv";

export const FetchAutoMindServerWithCommonResponse = async <T>(
  { method, path, ctx, body }: {
    method: HTTP_METHOD;
    path: string;
    ctx: TRPCContextWithSession;
    body?: object;
  },
) => {
  const res = await fetch(
    env.AUTOMIND_BACKEND_URL +
      path,
    {
      method: method,
      headers: new Headers({
        "Content-Type": "application/json",
        "X-User-Id": ctx.session.user.id,
      }),
      body: body ? JSON.stringify(body) : null,
    },
  );

  const result: MutationResponseResult<T> = await res.json();
  return result;
};

export const FetchAutoMindServerWithCsvResponse = async (
  { method, path, ctx, body }: {
    method: HTTP_METHOD;
    path: string;
    ctx: TRPCContextWithSession;
    body?: object;
  },
) => {
  const res = await fetch(
    env.AUTOMIND_BACKEND_URL +
      path,
    {
      method: method,
      headers: new Headers({
        "Content-Type": "application/json",
        "X-User-Id": ctx.session.user.id,
      }),
      body: body ? JSON.stringify(body) : null,
    },
  );

  if (res.status === 200) {
    const data = await (await res.blob()).text();
    return csvStr2Array(data);
  }
  return [];
};
