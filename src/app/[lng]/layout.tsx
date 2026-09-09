import { Toolbar } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { dir } from "i18next";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { ReactNode } from "react";

import type { Metadata } from "next";

import ConfirmDialog from "@/components/dialog/confirm-dialog";
import { ThemeProvider } from "@/components/provider/theme-provider";
import { authOptions } from "@/server/auth/auth";
import SessionProvider from "@/server/auth/session-provider";
import { TrpcProvider } from "@/server/trpc/react";
import { PageProps } from "@/types/page";
import { type ThemeMode } from "@/utils/theme/hook";

import "./globals.css";

export const metadata: Metadata = {
  title: "AutoMind",
  description: "Implement ML workflow, Ops automation",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout(
  { children, auth, params }: Readonly<
    {
      children: ReactNode;
      auth: ReactNode;
    } & PageProps
  >,
) {
  const lng = (await params).lng;
  const session = await getServerSession(authOptions);
  let theme;

  const cookieStore = await cookies();

  if (cookieStore.has("theme")) {
    theme = cookieStore.get("theme");
  }

  return (
    <html
      lang={lng}
      dir={dir(lng)}
    >
      <body>
        <TrpcProvider>
          <SessionProvider session={session}>
            <AppRouterCacheProvider options={{ enableCssLayer: true }}>
              <ThemeProvider initTheme={theme?.value as ThemeMode ?? "light"}>
                <Toolbar />
                {children}
                {auth}
                <ConfirmDialog />
              </ThemeProvider>
            </AppRouterCacheProvider>
          </SessionProvider>
        </TrpcProvider>
      </body>
    </html>
  );
}
