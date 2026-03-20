import React from "react";
import { DeleteTaskDialog } from "../../src/components/TaskDetailModal/DeleteTaskDialog";

describe("<DeleteTaskDialog />", () => {
  it("renders correctly", () => {
    cy.mount(
      <DeleteTaskDialog
        open={true}
        taskTitle="My Task"
        onClose={cy.stub()}
        onConfirm={cy.stub()}
      />,
    );
    cy.contains("Delete Task").should("be.visible");
    cy.contains("My Task").should("be.visible");
  });

  it("calls onConfirm on delete", () => {
    const onConfirmSpy = cy.spy().as("onConfirm");
    cy.mount(
      <DeleteTaskDialog
        open={true}
        taskTitle="My Task"
        onClose={cy.stub()}
        onConfirm={onConfirmSpy}
      />,
    );
    cy.contains("button", "Delete").click();
    cy.get("@onConfirm").should("have.been.called");
  });
});
