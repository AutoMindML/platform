"use client";

import { type Session } from "next-auth";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export default function SessionProvider(
  props: { session: Session | null; children: React.ReactNode },
) {
  return (
    <NextAuthSessionProvider session={props.session}>
      {props.children}
    </NextAuthSessionProvider>
  );
}
