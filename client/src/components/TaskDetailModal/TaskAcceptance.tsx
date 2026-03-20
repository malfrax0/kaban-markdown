import React from "react";
import { Box, Typography, TextField } from "@mui/material";

interface TaskAcceptanceProps {
  isEditing: boolean;
  acceptance: string;
  onChange: (value: string) => void;
}

export const TaskAcceptance: React.FC<TaskAcceptanceProps> = ({
  isEditing,
  acceptance,
  onChange,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 1, color: "secondary.light" }}>
        Acceptance Criteria
      </Typography>
      {isEditing ? (
        <TextField
          fullWidth
          multiline
          minRows={3}
          value={acceptance}
          onChange={(e) => onChange(e.target.value)}
          placeholder="- Criteria 1\n- Criteria 2"
          variant="outlined"
          sx={{ bgcolor: "background.paper" }}
        />
      ) : (
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {acceptance || "No acceptance criteria."}
        </Typography>
      )}
    </Box>
  );
};
