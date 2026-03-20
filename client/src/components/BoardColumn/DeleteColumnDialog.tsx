import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

interface DeleteColumnDialogProps {
  open: boolean;
  columnTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteColumnDialog: React.FC<DeleteColumnDialogProps> = ({
  open,
  columnTitle,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Column</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the column "{columnTitle}"? This
          action cannot be undone and will delete all tasks within it.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
