import { env } from "@/env.mjs";

export const testAutoMindAppWithJSONResponse = async (
  { body, apiKey, deploymentId }: {
    body?: object;
    apiKey: string;
    deploymentId: string;
  },
): Promise<object> => {
  const res = await fetch(
    `${env.AUTOMIND_BACKEND_URL}/api/app/deployment/${deploymentId}`,
    {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      }),
      body: body ? JSON.stringify(body) : null,
    },
  );

  const result = await res.json();
  return result;
};
