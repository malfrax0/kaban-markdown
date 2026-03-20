import React, { useState } from "react";
import { Paper } from "@mui/material";
import { type DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import type { Column, Task } from "../../types";

import { BoardColumnHeader } from "./BoardColumnHeader";
import { BoardColumnTaskList } from "./BoardColumnTaskList";
import { BoardColumnFooter } from "./BoardColumnFooter";
import { DeleteColumnDialog } from "./DeleteColumnDialog";

interface BoardColumnProps {
  column: Column;
  onTaskClick: (task: Task, columnId: string) => void;
  onEditColumn: (column: Column) => void;
  onUpdateTitle: (newTitle: string) => Promise<void>;
  onAddTask: (columnId: string, title: string) => Promise<void>;
  onDeleteColumn: (columnId: string) => Promise<void>;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  column,
  onTaskClick,
  onEditColumn,
  onUpdateTitle,
  onAddTask,
  onDeleteColumn,
  dragHandleProps,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleDeleteSubmit = async () => {
    await onDeleteColumn(column.id);
    setIsConfirmingDelete(false);
  };

  return (
    <>
      <Paper
        sx={{
          width: 320,
          minWidth: 320,
          mr: 2,
          backgroundColor: "rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "100%",
        }}
      >
        <BoardColumnHeader
          column={column}
          onUpdateTitle={onUpdateTitle}
          onEditColumn={onEditColumn}
          onDeleteRequest={() => setIsConfirmingDelete(true)}
          dragHandleProps={dragHandleProps}
        />

        <BoardColumnTaskList
          columnId={column.id}
          tasks={column.tasks}
          onTaskClick={(task) => onTaskClick(task, column.id)}
        />

        <BoardColumnFooter columnId={column.id} onAddTask={onAddTask} />
      </Paper>

      <DeleteColumnDialog
        open={isConfirmingDelete}
        columnTitle={column.title}
        onClose={() => setIsConfirmingDelete(false)}
        onConfirm={handleDeleteSubmit}
      />
    </>
  );
};
