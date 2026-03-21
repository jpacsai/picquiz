import { Button, Card, CardActions, CardContent, Typography } from '@mui/material';

import DeleteItemDialog from './DeleteItemDialog';

type AdminTopicItemViewProps = {
  description?: string;
  isDeleteDialogOpen: boolean;
  isDeleting: boolean;
  meta?: string;
  onCloseDeleteDialog: () => void;
  onConfirmDelete: () => void;
  onEdit: () => void;
  onOpenDeleteDialog: () => void;
  subtitle?: string;
  title: string;
};

const AdminTopicItemView = ({
  description,
  isDeleteDialogOpen,
  isDeleting,
  meta,
  onCloseDeleteDialog,
  onConfirmDelete,
  onEdit,
  onOpenDeleteDialog,
  subtitle,
  title,
}: AdminTopicItemViewProps) => {
  return (
    <Card sx={{ width: '100%' }}>
      <CardContent sx={{ display: 'grid', gap: 0.5 }}>
        <Typography variant="h6">{title}</Typography>
        {subtitle ? (
          <Typography color="text.secondary" variant="body2">
            {subtitle}
          </Typography>
        ) : null}
        {meta ? (
          <Typography color="text.secondary" variant="caption">
            {meta}
          </Typography>
        ) : null}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button variant="outlined" disabled={isDeleting} onClick={onEdit}>
          Szerkesztés
        </Button>
        <Button color="error" variant="text" disabled={isDeleting} onClick={onOpenDeleteDialog}>
          {isDeleting ? 'Törlés...' : 'Törlés'}
        </Button>
      </CardActions>

      <DeleteItemDialog
        description={description}
        isDeleting={isDeleting}
        onClose={onCloseDeleteDialog}
        onConfirm={onConfirmDelete}
        open={isDeleteDialogOpen}
        title={title}
      />
    </Card>
  );
};

export default AdminTopicItemView;
