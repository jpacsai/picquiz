import PhotoSizeSelectSmallIcon from '@mui/icons-material/PhotoSizeSelectSmall';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';

import DeleteItemDialog from '@/components/pages/Admin/TopicCollection/components/DeleteItemDialog';
import ImagePreviewDialog from '@/components/ui/Form/ImageUploadField/components/ImagePreviewDialog';

type AdminTopicItemCardViewProps = {
  description?: string;
  isDeleteDialogOpen: boolean;
  isDeleting: boolean;
  isMobileImagePreviewOpen: boolean;
  isMobileScreen: boolean;
  meta?: ReactNode;
  mobileImageAlt: string;
  mobileImageUrl?: string;
  onCloseDeleteDialog: () => void;
  onCloseMobileImagePreview: () => void;
  onConfirmDelete: () => void;
  onEdit: () => void;
  onMobileImageLoad: () => void;
  onOpenDeleteDialog: () => void;
  onOpenMobileImagePreview: () => void;
  showMobileImagePreviewLoader: boolean;
  subtitle?: ReactNode;
  title: string;
};

const AdminTopicItemCardView = ({
  description,
  isDeleteDialogOpen,
  isDeleting,
  isMobileImagePreviewOpen,
  isMobileScreen,
  meta,
  mobileImageAlt,
  mobileImageUrl,
  onCloseDeleteDialog,
  onCloseMobileImagePreview,
  onConfirmDelete,
  onEdit,
  onMobileImageLoad,
  onOpenDeleteDialog,
  onOpenMobileImagePreview,
  showMobileImagePreviewLoader,
  subtitle,
  title,
}: AdminTopicItemCardViewProps) => {
  return (
    <>
      <Card sx={{ width: '100%' }}>
        <CardContent sx={{ display: 'grid', gap: 0.5 }}>
          <Typography
            component="div"
            sx={{ alignItems: 'center', display: 'flex', gap: 1, justifyContent: 'space-between' }}
            variant="h6"
          >
            <span>{title}</span>
            {mobileImageUrl ? (
              <Tooltip title="Mobilkép megnyitása">
                <IconButton
                  aria-label="Mobilkép megnyitása"
                  color="primary"
                  size="small"
                  onClick={onOpenMobileImagePreview}
                >
                  <PhotoSizeSelectSmallIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
          </Typography>
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

      <ImagePreviewDialog
        imageAlt={mobileImageAlt}
        imageSrc={mobileImageUrl}
        isLoading={showMobileImagePreviewLoader}
        isMobileScreen={isMobileScreen}
        onClose={onCloseMobileImagePreview}
        open={isMobileImagePreviewOpen}
        onImageLoad={onMobileImageLoad}
      />
    </>
  );
};

export default AdminTopicItemCardView;
