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

type DeleteItemDialogProps = {
  description?: string;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
};

const DeleteItemDialog = ({
  description,
  isDeleting = false,
  onClose,
  onConfirm,
  open,
  title,
}: DeleteItemDialogProps) => {
  return (
    <Dialog open={open} onClose={isDeleting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Elem törlése</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Ez a művelet nem vonható vissza.
          </Typography>

          <Stack
            spacing={0.5}
            sx={{
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
              px: 2,
              py: 1.5,
            }}
          >
            <Typography variant="subtitle1">{title}</Typography>
            {description ? (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            ) : null}
          </Stack>

          <Alert severity="warning">
            Az item adatai törlődnek, és a kapcsolódó feltöltött képek is eltávolításra kerülhetnek.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isDeleting}>
          Mégse
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? 'Törlés...' : 'Törlés végleg'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteItemDialog;
