export const sortSelectOptions = (options: readonly string[]): string[] =>
  [...options].sort((left, right) =>
    left.localeCompare(right, 'hu', {
      sensitivity: 'base',
    }),
  );
