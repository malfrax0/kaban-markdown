import React from "react";
import { Box, Button, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

interface BoardHeaderProps {
  projectName: string;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({ projectName }) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        backdropFilter: "blur(5px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/")}
        sx={{ color: "white", mr: 2 }}
      >
        Back
      </Button>
      <Typography variant="h5" sx={{ fontWeight: "bold", color: "white" }}>
        {projectName}
      </Typography>
    </Box>
  );
};
