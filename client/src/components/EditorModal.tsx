import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import Editor from "@monaco-editor/react";

interface EditorModalProps {
  open: boolean;
  fileName: string;
  initialContent: string;
  onSave: (content: string) => void;
  onClose: () => void;
}

export const EditorModal: React.FC<EditorModalProps> = ({
  open,
  fileName,
  initialContent,
  onSave,
  onClose,
}) => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Editing {fileName}</DialogTitle>
      <DialogContent sx={{ height: "70vh", p: 0 }}>
        <Editor
          height="100%"
          defaultLanguage="markdown"
          theme="vs-dark"
          value={content}
          onChange={(val) => setContent(val || "")}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => onSave(content)}
          variant="contained"
          color="secondary"
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
