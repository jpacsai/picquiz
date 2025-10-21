export type Field = {
  key: string;
  label: string;
  type: string;
  reqired?: boolean;
  readonly?: boolean;
  options?: string[];
};

export type Topic = {
  id: string;
  label: string;
  slug: string;
  storage_prefix: string;
  fields: Field[];
};
