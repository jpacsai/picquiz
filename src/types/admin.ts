import type { ReactNode } from 'react';

export type UseAdminTopicItemResult = {
  description?: string;
  isDeleteDialogOpen: boolean;
  isDeleting: boolean;
  meta?: ReactNode;
  onCloseDeleteDialog: () => void;
  onConfirmDelete: () => void;
  onEdit: () => void;
  onOpenDeleteDialog: () => void;
  subtitle?: ReactNode;
  title: string;
};
