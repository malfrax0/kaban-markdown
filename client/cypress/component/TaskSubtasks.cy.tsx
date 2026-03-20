import React from "react";
import { TaskSubtasks } from "../../src/components/TaskDetailModal/TaskSubtasks";

describe("<TaskSubtasks />", () => {
  it("renders list", () => {
    cy.mount(
      <TaskSubtasks
        isEditing={false}
        subtasks={[{ text: "Sub 1", completed: false }]}
        onToggle={cy.stub()}
        onDelete={cy.stub()}
        onAdd={cy.stub()}
      />,
    );
    cy.contains("Sub 1").should("be.visible");
  });

  it("allows adding subtask in edit mode", () => {
    const onAddSpy = cy.spy().as("onAdd");
    cy.mount(
      <TaskSubtasks
        isEditing={true}
        subtasks={[]}
        onToggle={cy.stub()}
        onDelete={cy.stub()}
        onAdd={onAddSpy}
      />,
    );
    cy.get('input[placeholder="Add new subtask..."]').type("New Sub{enter}");
    cy.get("@onAdd").should("have.been.calledWith", "New Sub");
  });
});
