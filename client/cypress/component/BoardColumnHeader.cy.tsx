import React from "react";
import { BoardColumnHeader } from "../../src/components/BoardColumn/BoardColumnHeader";
import { Column } from "../../src/types";

describe("<BoardColumnHeader />", () => {
  const mockColumn: Column = {
    id: "col-1",
    title: "Test Column",
    tasks: [],
    projectId: "p1",
  };

  it("renders title correctly", () => {
    cy.mount(
      <BoardColumnHeader
        column={mockColumn}
        onUpdateTitle={cy.stub()}
        onEditColumn={cy.stub()}
        onDeleteRequest={cy.stub()}
      />,
    );
    cy.contains("Test Column").should("be.visible");
  });

  it("enters edit mode on click and saves on blur", () => {
    const onUpdateTitleSpy = cy.spy().as("onUpdateTitle");
    cy.mount(
      <BoardColumnHeader
        column={mockColumn}
        onUpdateTitle={onUpdateTitleSpy}
        onEditColumn={cy.stub()}
        onDeleteRequest={cy.stub()}
      />,
    );

    cy.contains("Test Column").click();
    cy.get("input").clear().type("New Title").blur();
    cy.get("@onUpdateTitle").should("have.been.calledWith", "New Title");
  });

  it("calls onDeleteRequest when delete icon clicked", () => {
    const onDeleteSpy = cy.spy().as("onDeleteRequest");
    cy.mount(
      <BoardColumnHeader
        column={mockColumn}
        onUpdateTitle={cy.stub()}
        onEditColumn={cy.stub()}
        onDeleteRequest={onDeleteSpy}
      />,
    );

    cy.get('button[aria-label="delete column"]').click();
    cy.get("@onDeleteRequest").should("have.been.called");
  });
});
