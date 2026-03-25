import { Alert, MenuItem, TextField } from '@mui/material';

import type { TopicFieldDraft } from '@/types/topicSchema';

type FieldDialogImageUploadSectionProps = {
  availableFileNameFieldOptions: Array<{ key: string; label: string }>;
  errorsByPath: Map<string, string>;
  field: TopicFieldDraft;
  onChange: (updater: (field: TopicFieldDraft) => TopicFieldDraft) => void;
  pathPrefix: string;
};

const FieldDialogImageUploadSection = ({
  availableFileNameFieldOptions,
  errorsByPath,
  field,
  onChange,
  pathPrefix,
}: FieldDialogImageUploadSectionProps) => {
  if (field.type !== 'imageUpload') {
    return null;
  }

  const hasAvailableFileNameFieldOptions = availableFileNameFieldOptions.length > 0;

  return (
    <>
      <TextField
        select
        disabled={!hasAvailableFileNameFieldOptions}
        SelectProps={{
          multiple: true,
          renderValue: (selected) =>
            (selected as string[])
              .map(
                (selectedKey) =>
                  availableFileNameFieldOptions.find((option) => option.key === selectedKey)
                    ?.label ?? selectedKey,
              )
              .join(', '),
        }}
        label="File name fields"
        value={field.fileNameFields ?? []}
        error={errorsByPath.has(`${pathPrefix}.fileNameFields`)}
        helperText={
          errorsByPath.get(`${pathPrefix}.fileNameFields`) ??
          (hasAvailableFileNameFieldOptions
            ? 'Valaszd ki a file-nevhez hasznalt required mezoket.'
            : 'Vegyel fel hozza legalabb egy required fieldet, es utana itt tudod kivalasztani a file-nevhez hasznalt mezoket.')
        }
        onChange={(event) => {
          const nextValue = event.target.value as unknown as string[];

          onChange((currentField) => ({
            ...currentField,
            fileNameFields: nextValue,
          }));
        }}
        fullWidth
        margin="normal"
      >
        {availableFileNameFieldOptions.map((option) => (
          <MenuItem key={option.key} value={option.key}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <Alert severity="info" sx={{ mt: 2 }}>
        A builder automatikusan kezeli a kepes rendszermezoket: `image_url_desktop`,
        `image_url_mobile`, `image_path_desktop`, `image_path_mobile`.
      </Alert>
    </>
  );
};

export default FieldDialogImageUploadSection;
