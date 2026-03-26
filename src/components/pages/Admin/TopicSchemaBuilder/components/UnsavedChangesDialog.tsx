import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import {
  useTopicSchemaBuilderActions,
  useTopicSchemaBuilderState,
} from '../context/useTopicSchemaBuilderContext';

const UnsavedChangesDialog = () => {
  const theme = useTheme();
  const { isUnsavedChangesDialogOpen } = useTopicSchemaBuilderState();
  const { handleConfirmNavigation, handleStayOnPage } = useTopicSchemaBuilderActions();

  return (
    <Dialog
      open={isUnsavedChangesDialogOpen}
      onClose={handleStayOnPage}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.paper,
          backgroundImage: 'none',
          border: `1px solid ${theme.customTokens.brand.accent}`,
          borderRadius: 3,
          boxShadow: `0 24px 64px ${theme.customTokens.brand.accentDark}66`,
        },
      }}
    >
      <DialogTitle
        sx={{
          color: theme.customTokens.onSurface.cardPrimary,
          pb: 1,
        }}
      >
        Nem mentett változások
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        <Typography color="text.secondary">
          Nem mentett változások vannak. Biztosan elnavigálsz mentés nélkül?
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleStayOnPage}
          sx={{
            color: theme.customTokens.onSurface.cardPrimary,
          }}
        >
          Maradok
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirmNavigation}
          sx={{
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.getContrastText(theme.palette.secondary.main),
            '&:hover': {
              backgroundColor: theme.palette.secondary.dark,
            },
          }}
        >
          Kilépek
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnsavedChangesDialog;
