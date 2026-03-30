import "./commands";

Cypress.on("uncaught:exception", (err) => {
  // Prevent Cypress from failing tests due to unrelated runtime errors.
  return false;
});
