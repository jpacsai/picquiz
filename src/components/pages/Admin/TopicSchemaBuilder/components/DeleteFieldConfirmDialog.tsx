import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

import {
  useTopicSchemaBuilderActions,
  useTopicSchemaBuilderState,
} from '../context/useTopicSchemaBuilderContext';

const DeleteFieldConfirmDialog = () => {
  const { isDeleteFieldDialogOpen, selectedField } = useTopicSchemaBuilderState();
  const { handleCloseDeleteFieldDialog, handleConfirmDeleteSelectedField } =
    useTopicSchemaBuilderActions();

  return (
    <Dialog open={isDeleteFieldDialogOpen} onClose={handleCloseDeleteFieldDialog} fullWidth maxWidth="xs">
      <DialogTitle>Field torlese</DialogTitle>
      <DialogContent>
        <Typography>
          Biztosan torolni szeretned ezt a fieldet: {selectedField?.label ?? selectedField?.key ?? 'ismeretlen field'}?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDeleteFieldDialog}>Megse</Button>
        <Button color="error" variant="contained" onClick={handleConfirmDeleteSelectedField}>
          Torles
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteFieldConfirmDialog;
