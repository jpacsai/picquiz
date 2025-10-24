/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMatches } from "@tanstack/react-router";
import { useMemo } from "react";

const usePageMeta = () => {
  const matches = useMatches();

  return useMemo(
    () =>
      matches.reduceRight((acc, m) => {
        if (acc) return acc;
        const title = (m.loaderData as any)?.title;
        return title;
      }, null) ?? [],
    [matches],
  );
};

export default usePageMeta;
