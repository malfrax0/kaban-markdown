import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@mui/material";
import type { Task, SubTask } from "../../types";

import { TaskDetailHeader } from "./TaskDetailHeader";
import { TaskDescription } from "./TaskDescription";
import { TaskAcceptance } from "./TaskAcceptance";
import { TaskSubtasks } from "./TaskSubtasks";
import { TaskDetailFooter } from "./TaskDetailFooter";
import { DeleteTaskDialog } from "./DeleteTaskDialog";

interface TaskDetailModalProps {
  open: boolean;
  task: Task | null;
  columnId?: string;
  projectId?: string;
  onUpdate?: (updates: Partial<Task>) => Promise<void>;
  onDelete?: (taskId: string) => Promise<void>;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  open,
  task,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [acceptance, setAcceptance] = useState("");
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setIsEditing(false);
      setIsConfirmingDelete(false);
    }
  }, [open]);

  useEffect(() => {
    if (task) {
      setDescription(task.metadata.description || "");
      setAcceptance(task.metadata.acceptance || "");
      setSubtasks(task.metadata.subtasks || []);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    if (onUpdate) {
      await onUpdate({
        ...task,
        metadata: {
          ...task.metadata,
          description,
          acceptance,
          subtasks,
        },
      });
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete && task) {
      await onDelete(task.id);
      onClose();
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (task) {
      setDescription(task.metadata.description || "");
      setAcceptance(task.metadata.acceptance || "");
      setSubtasks(task.metadata.subtasks || []);
    }
  };

  const handleToggleSubtask = async (index: number) => {
    if (isEditing) return;

    const newSubtasks = [...subtasks];
    newSubtasks[index].completed = !newSubtasks[index].completed;
    setSubtasks(newSubtasks);

    if (onUpdate) {
      await onUpdate({
        ...task,
        metadata: {
          ...task.metadata,
          subtasks: newSubtasks,
        },
      });
    }
  };

  const deleteSubtask = (index: number) => {
    const newSubtasks = [...subtasks];
    newSubtasks.splice(index, 1);
    setSubtasks(newSubtasks);
  };

  const addSubtask = (text: string) => {
    setSubtasks([...subtasks, { text, completed: false }]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <TaskDetailHeader
        title={task.title}
        isEditing={isEditing}
        onEdit={() => setIsEditing(true)}
      />

      <DialogContent dividers>
        <TaskDescription
          isEditing={isEditing}
          description={description}
          onChange={setDescription}
        />

        <TaskAcceptance
          isEditing={isEditing}
          acceptance={acceptance}
          onChange={setAcceptance}
        />

        <TaskSubtasks
          isEditing={isEditing}
          subtasks={subtasks}
          onToggle={handleToggleSubtask}
          onDelete={deleteSubtask}
          onAdd={addSubtask}
        />
      </DialogContent>

      <TaskDetailFooter
        isEditing={isEditing}
        onClose={onClose}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={cancelEdit}
        onDeleteRequest={() => setIsConfirmingDelete(true)}
      />

      <DeleteTaskDialog
        open={isConfirmingDelete}
        taskTitle={task.title}
        onClose={() => setIsConfirmingDelete(false)}
        onConfirm={handleDelete}
      />
    </Dialog>
  );
};
