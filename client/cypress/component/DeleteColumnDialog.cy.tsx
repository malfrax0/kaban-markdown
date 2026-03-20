import React from "react";
import { DeleteColumnDialog } from "../../src/components/BoardColumn/DeleteColumnDialog";

describe("<DeleteColumnDialog />", () => {
  it("renders correctly when open", () => {
    cy.mount(
      <DeleteColumnDialog
        open={true}
        columnTitle="Test Column"
        onClose={cy.stub().as("onClose")}
        onConfirm={cy.stub().as("onConfirm")}
      />,
    );

    cy.contains("Delete Column").should("be.visible");
    cy.contains("Test Column").should("be.visible");
  });

  it("calls onConfirm when delete is clicked", () => {
    const onConfirmSpy = cy.spy().as("onConfirmSpy");
    cy.mount(
      <DeleteColumnDialog
        open={true}
        columnTitle="Test Column"
        onClose={cy.stub()}
        onConfirm={onConfirmSpy}
      />,
    );

    cy.contains("button", "Delete").click();
    cy.get("@onConfirmSpy").should("have.been.called");
  });

  it("calls onClose when cancel is clicked", () => {
    const onCloseSpy = cy.spy().as("onCloseSpy");
    cy.mount(
      <DeleteColumnDialog
        open={true}
        columnTitle="Test Column"
        onClose={onCloseSpy}
        onConfirm={cy.stub()}
      />,
    );

    cy.contains("button", "Cancel").click();
    cy.get("@onCloseSpy").should("have.been.called");
  });
});
