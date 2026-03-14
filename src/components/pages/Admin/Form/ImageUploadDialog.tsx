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
  generatedFileNames: {
    desktop: string;
    mobile: string;
  };
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  open: boolean;
};

const ImageUploadDialog = ({
  generatedFileNames,
  onClose,
  onUpload,
  open,
}: ImageUploadDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'ready' | 'success' | 'error'>('idle');

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }

    setSelectedFileName('');
    setSelectedFile(null);
    setStatus('idle');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    onClose();
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
              const file = event.target.files?.[0];

              if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
              }

              setSelectedFile(file ?? null);
              setSelectedFileName(file?.name ?? '');
              setPreviewUrl(file ? URL.createObjectURL(file) : '');
              setStatus(file ? 'ready' : 'idle');
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
            {status === 'ready' && 'A kép készen áll a feltöltésre.'}
            {status === 'success' && 'A kép feltöltése sikeres volt.'}
            {status === 'error' && 'A kép feltöltése nem sikerült.'}
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Bezárás</Button>
        <Button
          variant="contained"
          disabled={!selectedFile}
          onClick={async () => {
            if (!selectedFile) {
              setStatus('error');
              return;
            }

            try {
              await onUpload(selectedFile);
              setStatus('success');
            } catch {
              setStatus('error');
            }
          }}
        >
          Feltöltés
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageUploadDialog;
