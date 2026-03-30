describe("Workstation end-to-end flow", () => {
  it("loads the homepage and navigates to login and register", () => {
    cy.visit("/");
    cy.contains("Get started").should("be.visible").click();
    cy.url().should("include", "/login");
    cy.contains("Sign in").should("be.visible");
    cy.go("back");
    cy.contains("Create account").click();
    cy.url().should("include", "/register");
    cy.contains("Create your team").should("be.visible");
  });

  it("logs in and loads the dashboard with tasks", () => {
    // Intercept client-side fetch if any to avoid timeouts but rely on SSR mainly
    cy.visit("/login");
    cy.get("#email").type("sanket@workstation.app");
    cy.get("#password").type("password1");
    cy.get("button[type=submit]").click();

    // Server-side rendering fetches tasks
    cy.url().should("include", "/dashboard");
    cy.contains("Your team board", { timeout: 10000 }).should("be.visible");

    // The mock-server has 4 tasks, or real DB depends on seed data
    cy.contains("Active tasks").should("be.visible");
    cy.get("button").contains("New task").should("be.visible");
  });

  it("creates a new task from the dashboard modal", () => {
    cy.setCookie("workstation-token", "mock-token");
    cy.visit("/dashboard", {
      onBeforeLoad(win) {
        win.localStorage.setItem("workstation-token", "mock-token");
      },
    });
    cy.contains("New task", { timeout: 10000 }).click();
    cy.get("#task-title").type("Review sprint roadmap");
    cy.get("#task-description").type(
      "Summarize the next sprint priorities for the team.",
    );
    cy.get("#task-project").select("Roadmap");
    // Wait for assignee to load or be present
    cy.get("#task-assignee").select("Sanket K").should("exist");
    cy.get("button[type=submit]")
      .contains(/Create task|Update task/)
      .click();
    cy.contains("Task created").should("be.visible");
  });

  it("navigates to analytics and validates team productivity", () => {
    cy.setCookie("workstation-token", "mock-token");
    cy.visit("/analytics", {
      onBeforeLoad(win) {
        win.localStorage.setItem("workstation-token", "mock-token");
      },
    });
    cy.contains("Team productivity insights", { timeout: 10000 }).should(
      "be.visible",
    );
    cy.contains("Productivity").should("exist");
  });

  it("loads the profile page and displays team members", () => {
    cy.setCookie("workstation-token", "mock-token");
    cy.visit("/profile", {
      onBeforeLoad(win) {
        win.localStorage.setItem("workstation-token", "mock-token");
      },
    });
    cy.contains("Profile", { timeout: 10000 }).should("be.visible");
    cy.contains("Sanket K").should("be.visible");
  });

  it("opens a task detail page directly", () => {
    cy.setCookie("workstation-token", "mock-token");
    cy.visit("/tasks/task-1", {
      onBeforeLoad(win) {
        win.localStorage.setItem("workstation-token", "mock-token");
      },
    });
    // Verify async params resolving correctly without 500 error
    cy.contains("Finalize product launch messaging", { timeout: 10000 }).should(
      "be.visible",
    );
    cy.contains(
      "Align the launch narrative with sales and marketing goals.",
    ).should("exist");
  });
});
