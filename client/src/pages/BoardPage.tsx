import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  DragDropContext,
  type DropResult,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { Box, Button } from "@mui/material";

import { api } from "../api";
import type { Column, Task } from "../types";
import { useProjectData } from "../hooks/useProjectData";

import { BoardColumn } from "../components/BoardColumn";
import { TaskDetailModal } from "../components/TaskDetailModal";
import { EditorModal } from "../components/EditorModal";
import { BoardHeader } from "../components/BoardHeader";

export const BoardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  // Use custom hook for data fetching
  const { project, setProject, loadProject } = useProjectData(projectId);

  const [selectedTaskContext, setSelectedTaskContext] = useState<{
    task: Task;
    colId: string;
  } | null>(null);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination || !project) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (type === "COLUMN") {
      const newColumns = [...project.columns];
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);

      setProject({ ...project, columns: newColumns });

      const newOrder = newColumns.map((c) => c.id + ".md");
      if (projectId) {
        api.reorderColumns(projectId, newOrder).catch(console.error);
      }
      return;
    }

    // Task Reordering
    const newColumns = [...project.columns];
    const sourceColIndex = newColumns.findIndex(
      (c) => c.id === source.droppableId,
    );
    const destColIndex = newColumns.findIndex(
      (c) => c.id === destination.droppableId,
    );

    const sourceCol = newColumns[sourceColIndex];
    const destCol = newColumns[destColIndex];

    const [movedTask] = sourceCol.tasks.splice(source.index, 1);
    destCol.tasks.splice(destination.index, 0, movedTask);

    setProject({ ...project, columns: newColumns });

    if (projectId) {
      api
        .moveTask(
          projectId,
          movedTask.id,
          source.droppableId,
          destination.droppableId,
          destination.index,
        )
        .then(() => loadProject())
        .catch((error) => {
          console.error("Failed to move task:", error);
          loadProject();
        });
    }
  };

  const handleSaveFile = async (content: string) => {
    if (projectId && editingColumn) {
      await api.saveFile(projectId, editingColumn.id + ".md", content);
      setEditingColumn(null);
      loadProject();
    }
  };

  const handleUpdateColumnTitle = async (
    columnId: string,
    newTitle: string,
  ) => {
    if (!projectId) return;

    if (columnId === "NEW_COLUMN_TEMP") {
      if (newTitle) {
        await api.createColumn(projectId, newTitle);
        setIsAddingColumn(false);
        loadProject();
      } else {
        setIsAddingColumn(false);
      }
    } else {
      try {
        await api.updateColumnTitle(projectId, columnId, newTitle);
        loadProject();
      } catch (e) {
        console.error("Failed to update column", e);
      }
    }
  };

  const handleAddTask = async (columnId: string, title: string) => {
    if (!projectId) return;
    try {
      await api.createTask(projectId, columnId, title);
      loadProject();
    } catch (e) {
      console.error("Failed to add task", e);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!projectId) return;
    try {
      await api.deleteColumn(projectId, columnId);
      loadProject();
    } catch (e) {
      console.error("Failed to delete column", e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!projectId || !selectedTaskContext) return;
    try {
      await api.deleteTask(projectId, selectedTaskContext.colId, taskId);
      setSelectedTaskContext(null);
      loadProject();
    } catch (e) {
      console.error("Failed to delete task", e);
    }
  };

  const handleTaskUpdate = async (updates: Partial<Task>) => {
    if (projectId && selectedTaskContext) {
      await api.updateTask(
        projectId,
        selectedTaskContext.colId,
        selectedTaskContext.task.id,
        updates,
      );
      loadProject();
    }
  };

  if (!project) return <Box p={4}>Loading...</Box>;

  const columnsToRender = isAddingColumn
    ? [
        ...project.columns,
        { id: "NEW_COLUMN_TEMP", title: "", tasks: [], raw: "" },
      ]
    : project.columns;

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(${project.metadata.background_image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <BoardHeader projectName={project.metadata.name} />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="COLUMN">
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                flexGrow: 1,
                p: 3,
                display: "flex",
                overflowX: "auto",
                alignItems: "flex-start",
              }}
            >
              {columnsToRender.map((col, index) => (
                <Draggable
                  key={col.id}
                  draggableId={col.id}
                  index={index}
                  isDragDisabled={col.id === "NEW_COLUMN_TEMP"}
                >
                  {(dragProvided) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      style={{ ...dragProvided.draggableProps.style }}
                    >
                      <BoardColumn
                        column={col}
                        onTaskClick={(task, colId) =>
                          setSelectedTaskContext({ task, colId })
                        }
                        onEditColumn={setEditingColumn}
                        onUpdateTitle={(title) =>
                          handleUpdateColumnTitle(col.id, title)
                        }
                        onAddTask={handleAddTask}
                        onDeleteColumn={handleDeleteColumn}
                        dragHandleProps={dragProvided.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {!isAddingColumn && (
                <Button
                  variant="outlined"
                  onClick={() => setIsAddingColumn(true)}
                  sx={{
                    minWidth: 300,
                    borderStyle: "dashed",
                    color: "text.secondary",
                  }}
                >
                  + Add Column
                </Button>
              )}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      <TaskDetailModal
        open={!!selectedTaskContext}
        task={selectedTaskContext?.task || null}
        columnId={selectedTaskContext?.colId}
        projectId={projectId}
        onUpdate={handleTaskUpdate}
        onDelete={handleDeleteTask}
        onClose={() => setSelectedTaskContext(null)}
      />

      {editingColumn && (
        <EditorModal
          open={!!editingColumn}
          fileName={editingColumn.id + ".md"}
          initialContent={editingColumn.raw}
          onSave={handleSaveFile}
          onClose={() => setEditingColumn(null)}
        />
      )}
    </Box>
  );
};
