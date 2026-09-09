"use client";

/**
 * https://zustand.docs.pmnd.rs/guides/nextjs
 *
 * This program aims to facilitate the generation of a
 * Zustand StoreProvider and useZustandStore hook for
 * use with Next.js SSR (Server-Side Rendering).
 * Please refer to the official documentation link at the top for details.
 */

import { createContext, type ReactNode, useContext, useRef } from "react";
import { StoreApi, useStore } from "zustand";

interface StoreProviderProps {
  children: ReactNode;
}

/**
 * Return
 * [StoreProvider, useZustandStore]
 */

export const createZustandStore = <I, T>(
  store: (initState?: I) => StoreApi<T>,
  initStore?: () => I,
): [
  (props: StoreProviderProps) => ReactNode,
  (selector: (store: T) => T) => T,
] => {
  const StoreContext = createContext<StoreApi<T> | undefined>(
    undefined,
  );

  const StoreProvider = ({
    children,
  }: StoreProviderProps) => {
    const storeRef = useRef<StoreApi<T> | null>(null);

    if (!storeRef.current) {
      storeRef.current = initStore ? store(initStore()) : store();
    }

    return (
      <StoreContext.Provider value={storeRef.current}>
        {children}
      </StoreContext.Provider>
    );
  };

  const useZustandStore = (
    selector: (store: T) => T,
  ): T => {
    const storeContext = useContext(StoreContext);

    if (!storeContext) {
      throw new Error(
        `useZustandStore must be used within StoreProvider`,
      );
    }

    return useStore(storeContext, selector);
  };

  return [StoreProvider, useZustandStore];
};
