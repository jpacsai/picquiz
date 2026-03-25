import { describe, expect, it } from 'vitest';

import type { TopicDraft } from '@/types/topicSchema';

import { hasTopicSchemaErrors, validateTopicDraft } from './topicSchemaValidation';

const createValidDraft = (): TopicDraft => ({
  fields: [
    {
      key: 'artist',
      label: 'Alkoto',
      required: true,
      type: 'string',
    },
    {
      key: 'title',
      label: 'Cim',
      required: true,
      type: 'string',
    },
    {
      hideInEdit: true,
      key: 'image_desktop',
      label: 'Image url - desktop',
      readonly: true,
      required: true,
      type: 'string',
    },
    {
      hideInEdit: true,
      key: 'image_mobile',
      label: 'Image url - mobile',
      readonly: true,
      required: true,
      type: 'string',
    },
    {
      key: 'era',
      label: 'Korszak',
      options: ['Reneszansz', 'Barokk'],
      quiz: {
        enabled: true,
        prompt: 'Melyik korszak?',
      },
      type: 'select',
    },
    {
      fileNameFields: ['artist', 'title'],
      key: 'image',
      label: 'Kep',
      required: true,
      targetFields: {
        desktop: 'image_desktop',
        mobile: 'image_mobile',
      },
      type: 'imageUpload',
    },
  ],
  id: 'art-topic',
  label: 'Muveszet',
  slug: 'art',
  storage_prefix: 'art',
});

describe('validateTopicDraft', () => {
  it('returns no errors for a valid draft', () => {
    const result = validateTopicDraft(createValidDraft());

    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(hasTopicSchemaErrors(result)).toBe(false);
  });

  it('reports required topic metadata errors', () => {
    const result = validateTopicDraft({
      fields: [],
    });

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'id' }),
        expect.objectContaining({ path: 'label' }),
        expect.objectContaining({ path: 'slug' }),
        expect.objectContaining({ path: 'storage_prefix' }),
      ]),
    );
  });

  it('reports duplicate field keys', () => {
    const draft = createValidDraft();
    draft.fields[1].key = 'artist';

    const result = validateTopicDraft(draft);

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: 'Field keys must be unique.' }),
      ]),
    );
  });

  it('requires select fields to define options', () => {
    const draft = createValidDraft();
    draft.fields[4].options = [];

    const result = validateTopicDraft(draft);

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'fields[4] (era).options' }),
      ]),
    );
  });

  it('requires image upload field references', () => {
    const draft = createValidDraft();
    draft.fields[5].fileNameFields = [];
    draft.fields[5].targetFields = {};

    const result = validateTopicDraft(draft);

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'fields[5] (image).fileNameFields' }),
        expect.objectContaining({ path: 'fields[5] (image).targetFields.desktop' }),
        expect.objectContaining({ path: 'fields[5] (image).targetFields.mobile' }),
      ]),
    );
  });

  it('rejects quiz config on image upload fields', () => {
    const draft = createValidDraft();
    draft.fields[5].quiz = {
      enabled: true,
      prompt: 'Mi van a kepen?',
    };

    const result = validateTopicDraft(draft);

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'fields[5] (image).quiz' }),
      ]),
    );
  });

  it('rejects derived references to missing fields', () => {
    const draft = createValidDraft();
    draft.fields[4].fn = {
      name: 'yearToCentury',
      source: 'missing',
    };

    const result = validateTopicDraft(draft);

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'fields[4] (era).fn.source' }),
      ]),
    );
  });

  it('returns a warning for required fields hidden in edit mode', () => {
    const draft = createValidDraft();
    draft.fields[0].hideInEdit = true;
    draft.fields[0].required = true;

    const result = validateTopicDraft(draft);

    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'fields[0] (artist).hideInEdit' }),
      ]),
    );
  });

  it('requires image upload fields themselves to be required', () => {
    const draft = createValidDraft();
    draft.fields[5].required = false;

    const result = validateTopicDraft(draft);

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'fields[5] (image).required' }),
      ]),
    );
  });

  it('requires image upload target fields to be hidden readonly required strings', () => {
    const draft = createValidDraft();
    draft.fields[2].required = false;

    const result = validateTopicDraft(draft);

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'fields[5] (image).targetFields.desktop' }),
      ]),
    );
  });

  it('requires derived range distractors to define a source field', () => {
    const draft = createValidDraft();
    draft.fields[0].quiz = {
      enabled: true,
      prompt: 'Melyik szazad?',
      distractor: {
        type: 'derivedRange',
        deriveWith: 'yearToCentury',
        sourceField: '',
        maxValue: 'todayYear',
      },
    };

    const result = validateTopicDraft(draft);

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'fields[0] (artist).quiz.distractor.sourceField' }),
      ]),
    );
  });

  it('requires range distractors to define a valid max value', () => {
    const draft = createValidDraft();
    draft.fields[0].type = 'number';
    draft.fields[0].quiz = {
      enabled: true,
      prompt: 'Melyik ev?',
      distractor: {
        type: 'numericRange',
        maxValue: Number.NaN,
      },
    };

    const result = validateTopicDraft(draft);

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'fields[0] (artist).quiz.distractor.maxValue' }),
      ]),
    );
  });
});
