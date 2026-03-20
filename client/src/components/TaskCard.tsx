import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { Draggable } from "@hello-pangea/dnd";
import type { Task } from "../types";

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index, onClick }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          sx={{
            mb: 2,
            backgroundColor: snapshot.isDragging
              ? "primary.dark"
              : "background.paper",
            // ...other styles from theme defaults
            cursor: "pointer",
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              {task.title}
            </Typography>
            {task.metadata.subtasks && (
              <Typography variant="caption" color="text.secondary">
                {task.metadata.subtasks.filter((t) => t.completed).length}/
                {task.metadata.subtasks.length} Subtasks
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
};
