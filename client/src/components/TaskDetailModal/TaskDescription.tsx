import React from "react";
import { Box, Typography, TextField } from "@mui/material";

interface TaskDescriptionProps {
  isEditing: boolean;
  description: string;
  onChange: (value: string) => void;
}

export const TaskDescription: React.FC<TaskDescriptionProps> = ({
  isEditing,
  description,
  onChange,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 1, color: "secondary.light" }}>
        Description
      </Typography>
      {isEditing ? (
        <TextField
          fullWidth
          multiline
          minRows={3}
          value={description}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Task description..."
          variant="outlined"
          sx={{ bgcolor: "background.paper" }}
        />
      ) : (
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {description || "No description provided."}
        </Typography>
      )}
    </Box>
  );
};
