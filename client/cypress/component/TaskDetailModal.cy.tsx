import React from "react";
import { TaskDetailModal } from "../../src/components/TaskDetailModal";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

const theme = createTheme();

const mockTask = {
  id: "task-1",
  title: "Test Task",
  content: "",
  raw: "",
  metadata: {
    description: "Detailed description here",
    acceptance: "Do it right",
    subtasks: [
      { text: "Subtask 1", completed: false },
      { text: "Subtask 2", completed: true },
    ],
  },
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);

describe("<TaskDetailModal />", () => {
  beforeEach(() => {
    cy.viewport(800, 600);
  });

  it("renders task details", () => {
    cy.mount(
      <Wrapper>
        <TaskDetailModal
          open={true}
          task={mockTask}
          onUpdate={cy.spy()}
          onDelete={cy.spy()}
          onClose={cy.spy()}
        />
      </Wrapper>,
    );

    cy.contains("Test Task").should("be.visible");
    cy.contains("Detailed description here").should("be.visible");
    cy.contains("Do it right").should("be.visible");
    cy.contains("Subtask 1").should("be.visible");
    cy.contains("Subtask 2").should("be.visible");
  });

  it("can toggle subtasks", () => {
    const onUpdateSpy = cy.spy().as("onUpdateSpy");

    cy.mount(
      <Wrapper>
        <TaskDetailModal
          open={true}
          task={mockTask}
          onUpdate={onUpdateSpy}
          onDelete={cy.spy()}
          onClose={cy.spy()}
        />
      </Wrapper>,
    );

    // Click subtask 1 checkbox
    // Text "Subtask 1" is in a ListItemText.
    // The structure is ListItem -> ListItemIcon -> Checkbox.
    // We can find the text, go up to ListItem, find checkbox input.
    cy.contains("Subtask 1")
      .parents("li")
      .find('input[type="checkbox"]')
      .click();

    // onUpdate should be called.
    cy.get("@onUpdateSpy").should("have.been.called");
  });
});
