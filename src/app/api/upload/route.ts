import { env } from "process";

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/server/auth/auth";

export const POST = async (req: NextRequest) => {
  const formData = await req.formData();
  const session = await getServerSession(authOptions);

  const res = await fetch(
    env.AUTOMIND_BACKEND_URL +
      "/api/dataset/file",
    {
      method: "POST",
      body: formData,
      headers: new Headers({
        "X-User-Id": session?.user.id ?? "",
      }),
    },
  );

  return res;
};
