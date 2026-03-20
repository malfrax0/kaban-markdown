import React from "react";
import { Box } from "@mui/material";
import { Droppable } from "@hello-pangea/dnd";
import type { Task } from "../../types";
import { TaskCard } from "../TaskCard";

interface BoardColumnTaskListProps {
  columnId: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const BoardColumnTaskList: React.FC<BoardColumnTaskListProps> = ({
  columnId,
  tasks,
  onTaskClick,
}) => {
  const isTemp = columnId === "NEW_COLUMN_TEMP";

  return (
    <Droppable droppableId={columnId} isDropDisabled={isTemp}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.droppableProps}
          sx={{
            p: 1,
            flexGrow: 1,
            overflowY: "auto",
            transition: "background-color 0.2s ease",
            backgroundColor: snapshot.isDraggingOver
              ? "rgba(74, 144, 226, 0.1)"
              : "transparent",
            minHeight: 100,
          }}
        >
          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onClick={(t) => onTaskClick(t)}
            />
          ))}
          {provided.placeholder}
        </Box>
      )}
    </Droppable>
  );
};
