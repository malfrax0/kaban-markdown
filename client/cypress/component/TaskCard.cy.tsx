import React from "react";
import { TaskCard } from "../../src/components/TaskCard";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

const theme = createTheme();

const mockTask = {
  id: "task-1",
  title: "Test Task",
  content: "",
  raw: "",
  metadata: {
    description: "A test task",
    subtasks: [
      { text: "Subtask 1", completed: true },
      { text: "Subtask 2", completed: false },
    ],
  },
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <DragDropContext onDragEnd={() => {}}>
      <Droppable droppableId="test-droppable">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  </ThemeProvider>
);

describe("<TaskCard />", () => {
  it("renders", () => {
    const onClickSpy = cy.spy().as("onClickSpy");

    cy.mount(
      <Wrapper>
        <TaskCard task={mockTask} index={0} onClick={onClickSpy} />
      </Wrapper>,
    );

    cy.contains("Test Task").should("be.visible");
    cy.contains("1/2 Subtasks").should("be.visible");
  });

  it("calls onClick when clicked", () => {
    const onClickSpy = cy.spy().as("onClickSpy");

    cy.mount(
      <Wrapper>
        <TaskCard task={mockTask} index={0} onClick={onClickSpy} />
      </Wrapper>,
    );

    cy.contains("Test Task").click();
    cy.get("@onClickSpy").should("have.been.calledWith", mockTask);
  });
});
