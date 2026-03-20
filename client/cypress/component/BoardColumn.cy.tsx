import React from "react";
import { BoardColumn } from "../../src/components/BoardColumn";
import { DragDropContext } from "@hello-pangea/dnd";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

const theme = createTheme();

const mockColumn = {
  id: "column-1",
  title: "Test Column",
  raw: "",
  tasks: [
    {
      id: "task-1",
      title: "Task 1",
      content: "",
      raw: "",
      metadata: { subtasks: [] },
    },
    {
      id: "task-2",
      title: "Task 2",
      content: "",
      raw: "",
      metadata: { subtasks: [] },
    },
  ],
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <DragDropContext onDragEnd={() => {}}>{children}</DragDropContext>
  </ThemeProvider>
);

describe("<BoardColumn />", () => {
  it("renders title and tasks", () => {
    cy.mount(
      <Wrapper>
        <BoardColumn
          column={mockColumn}
          onTaskClick={cy.spy()}
          onEditColumn={cy.spy()}
          onUpdateTitle={cy.spy()}
          onAddTask={cy.spy()}
          onDeleteColumn={cy.spy()}
        />
      </Wrapper>,
    );

    cy.contains("Test Column").should("be.visible");
    cy.contains("Task 1").should("be.visible");
    cy.contains("Task 2").should("be.visible");
  });

  it("can open add task input", () => {
    const onAddTaskSpy = cy.spy().as("onAddTaskSpy");

    cy.mount(
      <Wrapper>
        <BoardColumn
          column={mockColumn}
          onTaskClick={cy.spy()}
          onEditColumn={cy.spy()}
          onUpdateTitle={cy.spy()}
          onAddTask={onAddTaskSpy}
          onDeleteColumn={cy.spy()}
        />
      </Wrapper>,
    );

    // Click add button
    cy.contains("button", "Add Task").click();

    // Type new task
    cy.get('textarea[placeholder="Enter task title..."]').type("New Task Test");

    // Submit
    cy.contains("button", "Add").click();

    cy.get("@onAddTaskSpy").should(
      "have.been.calledWith",
      mockColumn.id,
      "New Task Test",
    );
  });
});
