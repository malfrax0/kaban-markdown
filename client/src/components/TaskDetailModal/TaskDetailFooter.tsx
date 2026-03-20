import React from "react";
import { DialogActions, Box, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

interface TaskDetailFooterProps {
  isEditing: boolean;
  onClose: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDeleteRequest: () => void;
}

export const TaskDetailFooter: React.FC<TaskDetailFooterProps> = ({
  isEditing,
  onClose,
  onEdit,
  onSave,
  onCancel,
  onDeleteRequest,
}) => {
  return (
    <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
      {isEditing ? (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          <Button onClick={onCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={onSave} variant="contained" color="primary">
            Save
          </Button>
        </Box>
      ) : (
        <>
          <Button
            startIcon={<DeleteIcon />}
            color="error"
            onClick={onDeleteRequest}
          >
            Delete
          </Button>
          <Box>
            <Button onClick={onClose} color="inherit" sx={{ mr: 1 }}>
              Close
            </Button>
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              onClick={onEdit}
            >
              Edit
            </Button>
          </Box>
        </>
      )}
    </DialogActions>
  );
};
