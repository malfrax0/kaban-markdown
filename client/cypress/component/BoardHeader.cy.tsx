import React from "react";
import { BrowserRouter } from "react-router-dom";
import { BoardHeader } from "../../src/components/BoardHeader";

describe("<BoardHeader />", () => {
  it("renders project name", () => {
    cy.mount(
      <BrowserRouter>
        <BoardHeader projectName="Test Project" />
      </BrowserRouter>,
    );
    cy.contains("Test Project").should("be.visible");
    cy.contains("Back").should("be.visible");
  });
});
