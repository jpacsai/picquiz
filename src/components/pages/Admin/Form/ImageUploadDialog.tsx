import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { useRef, useState } from 'react';

type ImageUploadDialogProps = {
  onClose: () => void;
  open: boolean;
};

const ImageUploadDialog = ({ onClose, open }: ImageUploadDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
              setSelectedFileName(file?.name ?? '');
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
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Bezárás</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageUploadDialog;
