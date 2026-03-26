import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import type { ImageFileNames, PendingImageSelection } from '@/types/topicItemForm';

import ImagePreviewSection from './ImagePreviewSection';

type ImageUploadDialogProps = {
  existingSelection?: Pick<PendingImageSelection, 'file' | 'previewUrl'> | null;
  generatedFileNames: ImageFileNames;
  onClose: () => void;
  onSelect: (file: File) => void;
  open: boolean;
};

const ImageUploadDialog = ({
  existingSelection,
  generatedFileNames,
  onClose,
  onSelect,
  open,
}: ImageUploadDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [draftSelection, setDraftSelection] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const [hasSelectionError, setHasSelectionError] = useState(false);

  const selectedFile = draftSelection?.file ?? existingSelection?.file ?? null;
  const selectedFileName = selectedFile?.name ?? '';
  const previewUrl = draftSelection?.previewUrl ?? existingSelection?.previewUrl ?? '';
  const status: 'idle' | 'ready' | 'error' = hasSelectionError
    ? 'error'
    : selectedFile
      ? 'ready'
      : 'idle';

  useEffect(() => {
    return () => {
      if (draftSelection?.previewUrl) {
        URL.revokeObjectURL(draftSelection.previewUrl);
      }
    };
  }, [draftSelection]);

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    if (draftSelection?.previewUrl) {
      URL.revokeObjectURL(draftSelection.previewUrl);
    }

    setDraftSelection(null);
    setHasSelectionError(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    onClose();
  };

  const handleFileChange = (file: File | null) => {
    if (draftSelection?.previewUrl) {
      URL.revokeObjectURL(draftSelection.previewUrl);
    }

    if (!file) {
      setDraftSelection(null);
      setHasSelectionError(false);
      return;
    }

    setDraftSelection({
      file,
      previewUrl: URL.createObjectURL(file),
    });
    setHasSelectionError(false);
  };

  const handleUseImage = () => {
    if (!selectedFile) {
      setHasSelectionError(true);
      return;
    }

    onSelect(selectedFile);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Image upload</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Válassz egy képet, amiből két képméretet generálunk.
          </Typography>

          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Maximális végső méretek:</Typography>
            <Typography variant="body2" color="text.secondary">
              Desktop: 800 x 600
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mobil: 330 x 400
            </Typography>
          </Stack>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              handleFileChange(event.target.files?.[0] ?? null);
            }}
          />

          <Stack direction="row" spacing={2} alignItems="center">
            <Button variant="outlined" onClick={handlePickImage}>
              Kép kiválasztása
            </Button>
            <Typography variant="body2" color="text.secondary">
              {selectedFileName || 'Még nincs kiválasztott fájl'}
            </Typography>
          </Stack>

          {previewUrl ? (
            <ImagePreviewSection
              fileName={selectedFileName}
              generatedFileNames={generatedFileNames}
              previewUrl={previewUrl}
            />
          ) : null}

          <Alert severity={status === 'error' ? 'error' : status === 'ready' ? 'info' : 'warning'}>
            {status === 'idle' && 'Válassz egy képet a folytatáshoz.'}
            {status === 'ready' && 'A kép készen áll a formhoz adásra.'}
            {status === 'error' && 'A kép kiválasztása nem sikerült.'}
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Bezárás</Button>
        <Button variant="contained" disabled={!selectedFile} onClick={handleUseImage}>
          Kép használata
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageUploadDialog;
