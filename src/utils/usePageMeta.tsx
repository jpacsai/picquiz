/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMatches } from '@tanstack/react-router';
import { useMemo } from 'react';

import type { PageMeta } from '../types/pageMeta';

const usePageMeta = (): PageMeta => {
  const matches = useMatches();

  return useMemo(
    () => {
      const meta = matches.reduceRight<PageMeta | null>((acc, match) => {
        if (acc) {
          return acc;
        }

        const data = match.loaderData as
          | {
              subtitle?: string;
              title?: string;
            }
          | undefined;

        if (!data?.title && !data?.subtitle) {
          return null;
        }

        return {
          title: data.title,
          subTitle: data.subtitle,
        };
      }, null);

      return meta ?? {};
    },
    [matches],
  );
};

export default usePageMeta;
