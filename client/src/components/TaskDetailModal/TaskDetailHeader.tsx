import React from "react";
import { DialogTitle, Typography, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

interface TaskDetailHeaderProps {
  title: string;
  isEditing: boolean;
  onEdit: () => void;
}

export const TaskDetailHeader: React.FC<TaskDetailHeaderProps> = ({
  title,
  isEditing,
  onEdit,
}) => {
  return (
    <DialogTitle
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="h5" color="primary.main">
        {title}
      </Typography>
      {!isEditing && (
        <Button startIcon={<EditIcon />} onClick={onEdit}>
          Edit
        </Button>
      )}
    </DialogTitle>
  );
};
