/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType, Key, ReactNode } from 'react';

import type { TopicField } from '@/types/topics';

export type FormMode = 'create' | 'edit';

export type FormDeriveFieldIndex = Omit<TopicField, 'fn'> & {
  fn?: {
    target: string;
    source: string;
    name: string;
  };
};

export type FormDeriveField = Omit<TopicField, 'fn'> & {
  fn?: {
    target: string;
    name: string;
  };
};

export type FormValues = Record<string, string | number>;

export type PersistableFormValues = Record<string, string | number>;

export type PendingImageSelection = {
  field: Extract<TopicField, { type: 'imageUpload' }>;
  file: File;
  previewUrl: string;
  uniqueSuffix: string;
};

export type PendingImageSelectionInput = {
  field: Extract<TopicField, { type: 'imageUpload' }>;
  file: File;
  uniqueSuffix: string;
};

export type ImageFileNames = {
  desktop: string;
  mobile: string;
};

export type FormFieldFormApi = {
  Field: ComponentType<{
    children: (fieldApi: any) => ReactNode;
    key?: Key;
    name: string;
    validators?: {
      onChange?: (props: { value: string | number }) => string | undefined;
    };
  }>;
  Subscribe: ComponentType<{
    children: (value: any) => ReactNode;
    key?: Key;
    selector: (state: any) => any;
  }>;
  setFieldValue: (field: string, value: string | number) => void;
  handleSubmit: () => Promise<void>;
  reset: () => void;
};

export type UseTopicItemFormResult = {
  derivationIndex: Record<string, FormDeriveField>;
  form: FormFieldFormApi;
  handleSelectPendingImage: (selection: PendingImageSelectionInput) => void;
  handleUndo: () => void;
  isSubmitting: boolean;
  mode: FormMode;
  pendingImageSelection: PendingImageSelection | null;
  submitError: string;
};
