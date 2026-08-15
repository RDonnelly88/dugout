
import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Match } from "@/types";

interface DeleteMatchDialogProps {
  match: Match | null;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

const DeleteMatchDialog = ({ match, onOpenChange, onConfirmDelete }: DeleteMatchDialogProps) => {
  return (
    <AlertDialog open={!!match} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-loss" />
            Delete Match
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this match? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmDelete} className="bg-destructive hover:bg-destructive">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteMatchDialog;
