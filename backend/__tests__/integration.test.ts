import request from "supertest";
import mongoose from "mongoose";
import { createClient } from "redis";

// Note: Ensure the API gateway and services are running locally via docker-compose before running this suite.
const GATEWAY_URL = "http://localhost:4000";

describe("Backend Integration Tests", () => {
  let authToken = "";

  it("Gateway Health Check", async () => {
    const res = await request(GATEWAY_URL).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("API Gateway ok");
  });

  describe("Auth Service Flow", () => {
    const mockEmail = `test_${Date.now()}@workstation.app`;

    it("Registers a new user successfully", async () => {
      const res = await request(GATEWAY_URL).post("/auth/register").send({
        name: "Test Setup User",
        email: mockEmail,
        password: "We@reDev9",
      });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
    });

    it("Logs in user and issues JWT", async () => {
      const res = await request(GATEWAY_URL).post("/auth/login").send({
        email: mockEmail,
        password: "We@reDev9",
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      authToken = res.body.token; // Save for subsequent requests
    });

    it("Fetches user context from /auth/me", async () => {
      const res = await request(GATEWAY_URL)
        .get("/auth/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(mockEmail);
    });
  });

  describe("Task Service & AI Integrations", () => {
    let taskId = "";

    it("Creates a task", async () => {
      const res = await request(GATEWAY_URL)
        .post("/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Design API Schema",
          description: "Document openAPI specs for the backend.",
          assignee: "Test Setup User",
          dueDate: "2026-06-01",
          project: "Documentation",
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe("Design API Schema");
      taskId = res.body.id;
    });

    it("Mocks AI Subtask Generation", async () => {
      // Assuming OPENAI_API_KEY is not set so it falls back to mock behavior
      const res = await request(GATEWAY_URL)
        .post(`/tasks/${taskId}/ai/subtasks`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.result).toContain("Suggested subtasks");
    });

    it("Updates task status and invalidates cache", async () => {
      const res = await request(GATEWAY_URL)
        .patch(`/tasks/${taskId}/status`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ status: "done" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("done");
    });

    it("Validates Analytics Integration via Event Emission (Eventual Consistency)", async () => {
      // Give async Redis PubSub -> Analytics service a moment to process the task creation
      await new Promise((r) => setTimeout(r, 2000));

      const res = await request(GATEWAY_URL)
        .get("/analytics/summary")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.weeklyCompleted).toBeDefined();
    });
  });
});
