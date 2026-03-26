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
  const accentColor = theme.customTokens?.brand.accent ?? theme.palette.secondary.main;
  const accentDarkColor = theme.customTokens?.brand.accentDark ?? theme.palette.secondary.dark;
  const primaryTextColor =
    theme.customTokens?.onSurface.cardPrimary ?? theme.palette.text.primary;

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
          border: `1px solid ${accentColor}`,
          borderRadius: 3,
          boxShadow: `0 24px 64px ${accentDarkColor}66`,
        },
      }}
    >
      <DialogTitle
        sx={{
          color: primaryTextColor,
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
            color: primaryTextColor,
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
