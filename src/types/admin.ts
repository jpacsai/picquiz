export type UseAdminTopicItemResult = {
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
