import React, { useState, useEffect } from "react";
import { Box, TextField, Typography, IconButton } from "@mui/material";
import { type DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import ArticleIcon from "@mui/icons-material/Article";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import type { Column } from "../../types";

interface BoardColumnHeaderProps {
  column: Column;
  onUpdateTitle: (newTitle: string) => Promise<void>;
  onEditColumn: (column: Column) => void;
  onDeleteRequest: () => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

export const BoardColumnHeader: React.FC<BoardColumnHeaderProps> = ({
  column,
  onUpdateTitle,
  onEditColumn,
  onDeleteRequest,
  dragHandleProps,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);

  useEffect(() => {
    if (column.id === "NEW_COLUMN_TEMP") {
      setIsEditingTitle(true);
    }
  }, [column.id]);

  const handleTitleSubmit = async () => {
    if (title.trim() && title !== column.title) {
      await onUpdateTitle(title);
    } else if (!title.trim() && column.id === "NEW_COLUMN_TEMP") {
      onUpdateTitle("");
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSubmit();
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {dragHandleProps && (
        <Box
          {...dragHandleProps}
          sx={{ mr: 1, cursor: "grab", display: "flex" }}
        >
          <DragIndicatorIcon
            fontSize="small"
            sx={{ color: "text.secondary" }}
          />
        </Box>
      )}

      {isEditingTitle ? (
        <TextField
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleSubmit}
          onKeyDown={handleKeyDown}
          autoFocus
          size="small"
          variant="standard"
          fullWidth
          sx={{
            mr: 1,
            "& .MuiInputBase-input": {
              fontSize: "1.25rem",
              fontWeight: 500,
            },
          }}
        />
      ) : (
        <Typography
          variant="h6"
          onClick={() => setIsEditingTitle(true)}
          sx={{ cursor: "pointer", flexGrow: 1 }}
        >
          {column.title}
        </Typography>
      )}

      {column.id !== "NEW_COLUMN_TEMP" && (
        <Box>
          <IconButton
            size="small"
            onClick={() => onEditColumn(column)}
            aria-label="edit column"
          >
            <ArticleIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={onDeleteRequest}
            color="error"
            aria-label="delete column"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};
