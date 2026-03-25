import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';

import type { FieldDeletionDependency } from '../context/fieldActions';

type DeleteFieldBlockedDialogProps = {
  dependencies: FieldDeletionDependency[];
  fieldLabel: string;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteFieldBlockedDialog = ({
  dependencies,
  fieldLabel,
  isOpen,
  onClose,
}: DeleteFieldBlockedDialogProps) => (
  <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>Field nem torolheto</DialogTitle>
    <DialogContent>
      <Stack spacing={1.5}>
        <Typography>
          A(z) {fieldLabel} field most nem torolheto, mert mas mezok hivatkoznak ra.
        </Typography>

        <Stack spacing={0.75}>
          {dependencies.map((dependency) => (
            <Typography key={`${dependency.fieldKey}-${dependency.reason}`} color="text.secondary">
              {dependency.fieldLabel}: {dependency.reason}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button variant="contained" onClick={onClose}>
        Rendben
      </Button>
    </DialogActions>
  </Dialog>
);

export default DeleteFieldBlockedDialog;
