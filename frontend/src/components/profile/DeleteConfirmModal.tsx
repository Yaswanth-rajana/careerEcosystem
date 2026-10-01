'use client';

import React from 'react';
import { Modal } from '@/components/design-system/Modal';
import { Button } from '@/components/design-system/Button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName?: string;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  isDeleting = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
          <p className="text-xs leading-relaxed">
            Are you sure you want to delete {itemName ? <strong>&ldquo;{itemName}&rdquo;</strong> : 'this record'}? This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} isLoading={isDeleting}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
