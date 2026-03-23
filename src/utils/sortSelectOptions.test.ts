import { describe, expect, it } from 'vitest';

import { sortSelectOptions } from './sortSelectOptions';

describe('sortSelectOptions', () => {
  it('sorts values alphabetically without mutating the original array', () => {
    const options = ['Zimbabwe', 'alma', 'Árnyék', 'Banana'];

    expect(sortSelectOptions(options)).toEqual(['alma', 'Árnyék', 'Banana', 'Zimbabwe']);
    expect(options).toEqual(['Zimbabwe', 'alma', 'Árnyék', 'Banana']);
  });
});
