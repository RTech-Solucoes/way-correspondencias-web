'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

type OkAlertProps = {
  open: boolean;
  onClose: () => void;
  message: string;
  title?: string;
  actionLabel?: string;
};

export default function OkAlert({ open, onClose, message, title = 'Atenção', actionLabel = 'OK' }: OkAlertProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end">
          <AlertDialogAction onClick={onClose}>{actionLabel}</AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}


