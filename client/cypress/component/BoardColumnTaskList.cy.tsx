import React from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { BoardColumnTaskList } from "../../src/components/BoardColumn/BoardColumnTaskList";
import type { Task } from "../../src/types";

describe("<BoardColumnTaskList />", () => {
  const mockTasks: Task[] = [
    {
      id: "t1",
      title: "Task 1",
      columnId: "c1",
      projectId: "p1",
      metadata: {},
    },
    {
      id: "t2",
      title: "Task 2",
      columnId: "c1",
      projectId: "p1",
      metadata: {},
    },
  ];

  it("renders list of tasks", () => {
    cy.mount(
      <DragDropContext onDragEnd={() => {}}>
        <BoardColumnTaskList
          columnId="c1"
          tasks={mockTasks}
          onTaskClick={cy.stub()}
        />
      </DragDropContext>,
    );

    cy.contains("Task 1").should("be.visible");
    cy.contains("Task 2").should("be.visible");
  });

  it("calls onTaskClick when task clicked", () => {
    const onTaskClickSpy = cy.spy().as("onTaskClick");
    cy.mount(
      <DragDropContext onDragEnd={() => {}}>
        <BoardColumnTaskList
          columnId="c1"
          tasks={mockTasks}
          onTaskClick={onTaskClickSpy}
        />
      </DragDropContext>,
    );

    cy.contains("Task 1").click();
    cy.get("@onTaskClick").should("have.been.calledWith", mockTasks[0]);
  });
});
