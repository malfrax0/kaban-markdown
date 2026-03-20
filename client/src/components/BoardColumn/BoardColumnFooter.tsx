import React, { useState } from "react";
import { Box, TextField, Button, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

interface BoardColumnFooterProps {
  columnId: string;
  onAddTask: (columnId: string, title: string) => Promise<void>;
}

export const BoardColumnFooter: React.FC<BoardColumnFooterProps> = ({
  columnId,
  onAddTask,
}) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleAddTaskSubmit = async () => {
    if (newTaskTitle.trim()) {
      await onAddTask(columnId, newTaskTitle);
      setNewTaskTitle("");
      setIsAddingTask(false);
    }
  };

  if (columnId === "NEW_COLUMN_TEMP") {
    return null;
  }

  return (
    <Box sx={{ p: 1 }}>
      {isAddingTask ? (
        <Box
          sx={{
            p: 1,
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: 1,
          }}
        >
          <TextField
            autoFocus
            fullWidth
            multiline
            placeholder="Enter task title..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddTaskSubmit();
              } else if (e.key === "Escape") {
                setIsAddingTask(false);
              }
            }}
            variant="outlined"
            size="small"
            sx={{
              mb: 1,
              "& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
            }}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleAddTaskSubmit}
              disabled={!newTaskTitle.trim()}
            >
              Add
            </Button>
            <IconButton
              size="small"
              onClick={() => setIsAddingTask(false)}
              aria-label="cancel add task"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Button
          startIcon={<AddIcon />}
          fullWidth
          sx={{
            justifyContent: "flex-start",
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.05)",
              color: "text.primary",
            },
          }}
          onClick={() => setIsAddingTask(true)}
        >
          Add Task
        </Button>
      )}
    </Box>
  );
};
