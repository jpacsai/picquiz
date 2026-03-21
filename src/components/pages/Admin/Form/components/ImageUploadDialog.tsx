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

import ImagePreviewSection from './ImagePreviewSection';

type ImageUploadDialogProps = {
  existingSelection?: {
    file: File;
    previewUrl: string;
  } | null;
  generatedFileNames: {
    desktop: string;
    mobile: string;
  };
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'ready' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedFile(existingSelection?.file ?? null);
    setSelectedFileName(existingSelection?.file.name ?? '');
    setPreviewUrl(existingSelection?.previewUrl ?? '');
    setStatus(existingSelection ? 'ready' : 'idle');
  }, [existingSelection, open]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== existingSelection?.previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [existingSelection?.previewUrl, previewUrl]);

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    if (previewUrl && previewUrl !== existingSelection?.previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(existingSelection?.previewUrl ?? '');
    setSelectedFile(existingSelection?.file ?? null);
    setSelectedFileName(existingSelection?.file.name ?? '');
    setStatus(existingSelection ? 'ready' : 'idle');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    onClose();
  };

  const handleFileChange = (file: File | null) => {
    if (previewUrl && previewUrl !== existingSelection?.previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setSelectedFileName('');
    setPreviewUrl('');

    if (!file) {
      setStatus(existingSelection ? 'ready' : 'idle');
      return;
    }

    setSelectedFile(file);
    setSelectedFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus('ready');
  };

  const handleUseImage = () => {
    if (!selectedFile) {
      setStatus('error');
      return;
    }

    onSelect(selectedFile);
    setStatus('success');
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

          <Alert
            severity={
              status === 'success'
                ? 'success'
                : status === 'error'
                  ? 'error'
                  : status === 'ready'
                    ? 'info'
                    : 'warning'
            }
          >
            {status === 'idle' && 'Válassz egy képet a folytatáshoz.'}
            {status === 'ready' && 'A kép készen áll a formhoz adásra.'}
            {status === 'success' && 'A kép bekerült a form ideiglenes állapotába.'}
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
