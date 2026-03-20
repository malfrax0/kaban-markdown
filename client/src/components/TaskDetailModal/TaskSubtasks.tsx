import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  Checkbox,
  ListItemText,
  IconButton,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import type { SubTask } from "../../types";

interface TaskSubtasksProps {
  isEditing: boolean;
  subtasks: SubTask[];
  onToggle: (index: number) => void;
  onDelete: (index: number) => void;
  onAdd: (text: string) => void;
}

export const TaskSubtasks: React.FC<TaskSubtasksProps> = ({
  isEditing,
  subtasks,
  onToggle,
  onDelete,
  onAdd,
}) => {
  const [newSubtaskText, setNewSubtaskText] = useState("");

  const handleAdd = () => {
    if (newSubtaskText.trim()) {
      onAdd(newSubtaskText.trim());
      setNewSubtaskText("");
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 1, color: "secondary.light" }}>
        Tasks
      </Typography>
      <List dense>
        {subtasks.map((sub, idx) => (
          <ListItem
            key={idx}
            secondaryAction={
              isEditing ? (
                <IconButton edge="end" onClick={() => onDelete(idx)}>
                  <DeleteIcon />
                </IconButton>
              ) : null
            }
          >
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={sub.completed}
                onChange={() => onToggle(idx)}
                disabled={isEditing}
              />
            </ListItemIcon>
            <ListItemText primary={sub.text} />
          </ListItem>
        ))}

        {isEditing && (
          <ListItem>
            <TextField
              fullWidth
              size="small"
              placeholder="Add new subtask..."
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <IconButton onClick={handleAdd} color="primary" sx={{ ml: 1 }}>
              <AddIcon />
            </IconButton>
          </ListItem>
        )}
      </List>
    </Box>
  );
};
