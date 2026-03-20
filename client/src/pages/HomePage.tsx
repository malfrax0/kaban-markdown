import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CardMedia,
  CardActionArea,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import type { ProjectMetadata } from "../types";

interface ProjectDialogState {
  open: boolean;
  mode: "create" | "edit";
  projectId?: string;
  name: string;
  description: string;
  backgroundImage: string;
}

const emptyDialog: ProjectDialogState = {
  open: false,
  mode: "create",
  name: "",
  description: "",
  backgroundImage: "",
};

export const HomePage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [dialog, setDialog] = useState<ProjectDialogState>(emptyDialog);
  const navigate = useNavigate();

  const loadProjects = () => api.getProjects().then(setProjects);

  useEffect(() => {
    loadProjects();
  }, []);

  const handleOpenCreate = () => {
    setDialog({ ...emptyDialog, open: true, mode: "create" });
  };

  const handleOpenEdit = (project: ProjectMetadata) => {
    setDialog({
      open: true,
      mode: "edit",
      projectId: project.id,
      name: project.name,
      description: project.description,
      backgroundImage: project.background_image || "",
    });
  };

  const handleClose = () => setDialog(emptyDialog);

  const handleSubmit = async () => {
    if (!dialog.name.trim()) return;

    if (dialog.mode === "create") {
      const projectId = await api.createProject(
        dialog.name,
        dialog.description,
        dialog.backgroundImage || undefined
      );
      handleClose();
      await loadProjects();
      navigate(`/board/${projectId}`);
    } else if (dialog.mode === "edit" && dialog.projectId) {
      await api.updateProjectMetadata(dialog.projectId, {
        name: dialog.name,
        description: dialog.description,
        background_image: dialog.backgroundImage || undefined,
      });
      handleClose();
      await loadProjects();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <Typography
          variant="h3"
          sx={{ color: "primary.main", fontWeight: "bold" }}
        >
          Galactic Mission Control
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          New Project
        </Button>
      </Box>
      <Grid container spacing={4}>
        {projects.map((project) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.02)" },
              }}
            >
              <CardActionArea
                onClick={() => navigate(`/board/${project.id}`)}
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                {project.background_image && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={project.background_image}
                    alt={project.name}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions sx={{ justifyContent: "flex-end" }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEdit(project);
                  }}
                  sx={{ color: "text.secondary" }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create / Edit Project Dialog */}
      <Dialog
        open={dialog.open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialog.mode === "create" ? "Create New Project" : "Edit Project"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}
        >
          <TextField
            label="Project Name"
            value={dialog.name}
            onChange={(e) => setDialog({ ...dialog, name: e.target.value })}
            fullWidth
            required
            autoFocus
          />
          <TextField
            label="Description"
            value={dialog.description}
            onChange={(e) =>
              setDialog({ ...dialog, description: e.target.value })
            }
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            label="Background Image URL"
            value={dialog.backgroundImage}
            onChange={(e) =>
              setDialog({ ...dialog, backgroundImage: e.target.value })
            }
            fullWidth
            placeholder="https://..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!dialog.name.trim()}
          >
            {dialog.mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
