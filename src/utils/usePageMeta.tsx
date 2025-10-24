/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMatches } from '@tanstack/react-router';
import { useMemo } from 'react';
import type { PageMeta } from '../types/pageMeta';

const usePageMeta = (): PageMeta => {
  const matches = useMatches();

  return useMemo(
    () =>
      matches.reduceRight((acc, m) => {
        if (acc) return acc;
        const data = m.loaderData as any;
        const title = data?.title;
        const subTitle = data?.subtitle;
        return { title, subTitle };
      }, null) ?? [],
    [matches],
  );
};

export default usePageMeta;
