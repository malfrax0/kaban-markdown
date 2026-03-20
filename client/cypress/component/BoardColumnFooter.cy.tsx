import React from "react";
import { BoardColumnFooter } from "../../src/components/BoardColumn/BoardColumnFooter";

describe("<BoardColumnFooter />", () => {
  it("renders Add Task button by default", () => {
    cy.mount(<BoardColumnFooter columnId="col-1" onAddTask={cy.stub()} />);
    cy.contains("button", "Add Task").should("be.visible");
  });

  it("shows input field when Add Task clicked", () => {
    cy.mount(<BoardColumnFooter columnId="col-1" onAddTask={cy.stub()} />);
    cy.contains("button", "Add Task").click();
    cy.get('textarea[placeholder="Enter task title..."]')
      .should("be.visible")
      .and("have.focus");
    cy.contains("button", "Add").should("be.visible").and("be.disabled");
  });

  it("calls onAddTask when submitted", () => {
    const onAddTaskSpy = cy.spy().as("onAddTask");
    cy.mount(<BoardColumnFooter columnId="col-1" onAddTask={onAddTaskSpy} />);
    cy.contains("button", "Add Task").click();
    cy.get('textarea[placeholder="Enter task title..."]').type("New Task");
    cy.contains("button", "Add").click();

    cy.get("@onAddTask").should("have.been.calledWith", "col-1", "New Task");
  });

  it("cancels adding task", () => {
    cy.mount(<BoardColumnFooter columnId="col-1" onAddTask={cy.stub()} />);
    cy.contains("button", "Add Task").click();
    cy.get("textarea").should("exist");

    cy.get('button[aria-label="cancel add task"]').click();

    cy.contains("button", "Add Task").should("be.visible");
    cy.get("textarea").should("not.exist");
  });
});
