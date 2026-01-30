import request from "supertest";

// Mock dependencies before importing app
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));
jest.mock("mongoose");

import { app } from "../index";
import { Task } from "../models/Task";
import { Project } from "../models/Project";
import { Sprint } from "../models/Sprint";
import * as jwt from "jsonwebtoken";

jest.mock("../models/Task");
jest.mock("../models/Project");
jest.mock("../models/Sprint");
jest.mock("jsonwebtoken");
jest.mock("redis", () => ({
  createClient: () => ({
    connect: jest.fn().mockResolvedValue(true),
    on: jest.fn(),
    del: jest.fn().mockResolvedValue(true),
    publish: jest.fn().mockResolvedValue(true),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(true),
  }),
}));
jest.mock("openai");

describe("Task Service Unit Tests", () => {
  const mockToken = "mock-jwt-token";
  const mockAdmin = {
    id: "admin123",
    email: "admin@example.com",
    role: "Admin",
  };
  const mockMember = {
    id: "member123",
    email: "developer@example.com",
    role: "Developer",
  };
  const mockPM = {
    id: "pm123",
    email: "pm@example.com",
    role: "Project Manager",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (jwt.verify as jest.Mock).mockReturnValue(mockAdmin);
  });

  describe("POST /tasks", () => {
    it("should create a task and return 201", async () => {
      const mockTask = {
        _id: "task123",
        title: "New Task",
        description: "Task description",
        status: "todo",
        priority: "high",
        assignee: "John Doe",
        dueDate: "2026-01-01",
      };

      (Task.create as jest.Mock).mockResolvedValue(mockTask);

      const res = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({
          title: "New Task",
          description: "Task description",
          assignee: "John Doe",
          dueDate: "2026-01-01",
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("New Task");
      expect(Task.create).toHaveBeenCalled();
    });

    it("should handle task creation with all optional fields", async () => {
      const mockTask = {
        _id: "task456",
        title: "Complete Task",
        description: "Full task description",
        status: "inprogress",
        priority: "medium",
        assignee: "Jane Doe",
        dueDate: "2026-02-01",
        projectId: "project123",
        sprintId: "sprint123",
        subtasks: ["Subtask 1", "Subtask 2"],
      };

      (Task.create as jest.Mock).mockResolvedValue(mockTask);

      const res = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${mockToken}`)
        .send(mockTask);

      expect(res.status).toBe(201);
      expect(res.body.sprintId).toBe("sprint123");
      expect(res.body.subtasks).toHaveLength(2);
    });

    it("should return 400 for invalid task data", async () => {
      const res = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({ title: "" });

      expect(res.status).toBe(400);
    });

    it("should return 400 for missing required fields", async () => {
      const res = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({ title: "Task" });

      expect(res.status).toBe(400);
    });

    it("should return 401 without authentication", async () => {
      const res = await request(app).post("/tasks").send({
        title: "New Task",
        description: "Description",
        assignee: "John Doe",
        dueDate: "2026-01-01",
      });

      expect(res.status).toBe(401);
    });

    it("should return 401 with invalid token", async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const res = await request(app)
        .post("/tasks")
        .set("Authorization", "Bearer invalid")
        .send({
          title: "New Task",
          description: "Description",
          assignee: "John Doe",
          dueDate: "2026-01-01",
        });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /tasks/:id", () => {
    it("should return task by ID", async () => {
      const mockTask = {
        _id: "task123",
        title: "Found Task",
        description: "Description",
      };
      (Task.findById as jest.Mock).mockResolvedValue(mockTask);

      const res = await request(app).get("/tasks/task123");

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Found Task");
      expect(Task.findById).toHaveBeenCalledWith("task123");
    });

    it("should return 404 if task not found", async () => {
      (Task.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get("/tasks/nonexistent");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Task not found");
    });

    it("should handle database errors gracefully", async () => {
      (Task.findById as jest.Mock).mockRejectedValue(new Error("DB error"));

      const res = await request(app).get("/tasks/task123");

      expect(res.status).toBe(500);
    });
  });

  describe("PUT /tasks/:id", () => {
    it("should update task successfully", async () => {
      const updatedTask = {
        _id: "task123",
        title: "Updated Task",
        description: "Updated description",
        status: "done",
      };

      (Task.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedTask);

      const res = await request(app)
        .put("/tasks/task123")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({ status: "done" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("done");
    });

    it("should return 404 if task not found for update", async () => {
      (Task.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put("/tasks/nonexistent")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({ status: "done" });

      expect(res.status).toBe(404);
    });

    it("should return 400 for invalid update data", async () => {
      const res = await request(app)
        .put("/tasks/task123")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({ status: "invalid-status" });

      expect(res.status).toBe(400);
    });

    it("should require authentication", async () => {
      const res = await request(app)
        .put("/tasks/task123")
        .send({ status: "done" });

      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /tasks/:id/status", () => {
    it("should update task status", async () => {
      const mockTask = {
        _id: "task123",
        status: "todo",
        save: jest.fn().mockResolvedValue(true),
      };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);

      const res = await request(app)
        .patch("/tasks/task123/status")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({ status: "inprogress" });

      expect(res.status).toBe(200);
      expect(mockTask.status).toBe("inprogress");
      expect(mockTask.save).toHaveBeenCalled();
    });

    it("should return 400 without status", async () => {
      const res = await request(app)
        .patch("/tasks/task123/status")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Status is required");
    });

    it("should return 404 if task not found", async () => {
      (Task.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .patch("/tasks/task123/status")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({ status: "done" });

      expect(res.status).toBe(404);
    });

    it("should prevent updating tasks in completed sprints", async () => {
      const mockTask = {
        _id: "task123",
        status: "todo",
        sprintId: "sprint123",
      };

      const mockSprint = {
        _id: "sprint123",
        status: "completed",
      };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);
      (Sprint.findById as jest.Mock).mockResolvedValue(mockSprint);

      const res = await request(app)
        .patch("/tasks/task123/status")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({ status: "done" });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("read-only");
    });

    it("should allow updating tasks in active sprints", async () => {
      const mockTask = {
        _id: "task123",
        status: "todo",
        sprintId: "sprint123",
        save: jest.fn().mockResolvedValue(true),
      };

      const mockSprint = {
        _id: "sprint123",
        status: "active",
      };

      (Task.findById as jest.Mock).mockResolvedValue(mockTask);
      (Sprint.findById as jest.Mock).mockResolvedValue(mockSprint);

      const res = await request(app)
        .patch("/tasks/task123/status")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({ status: "done" });

      expect(res.status).toBe(200);
      expect(mockTask.save).toHaveBeenCalled();
    });

    it("should require authentication", async () => {
      const res = await request(app)
        .patch("/tasks/task123/status")
        .send({ status: "done" });

      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /tasks/:id", () => {
    it("should delete task and return 204", async () => {
      const mockTask = { _id: "task123" };
      (Task.findByIdAndDelete as jest.Mock).mockResolvedValue(mockTask);

      const res = await request(app)
        .delete("/tasks/task123")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(204);
      expect(Task.findByIdAndDelete).toHaveBeenCalledWith("task123");
    });

    it("should return 404 if task not found for deletion", async () => {
      (Task.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .delete("/tasks/task123")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(404);
    });

    it("should require authentication", async () => {
      const res = await request(app).delete("/tasks/task123");

      expect(res.status).toBe(401);
    });
  });

  describe("GET /tasks (list with filters)", () => {
    it("should list all tasks for authenticated user", async () => {
      const mockTasks = [
        { _id: "task1", title: "Task 1" },
        { _id: "task2", title: "Task 2" },
      ];

      (Project.find as jest.Mock).mockResolvedValue([{ _id: "project1" }]);
      (Task.find as jest.Mock).mockResolvedValue(mockTasks);

      const res = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should filter tasks by projectId", async () => {
      const mockTasks = [
        { _id: "task1", title: "Task 1", projectId: "project1" },
      ];
      (Task.find as jest.Mock).mockResolvedValue(mockTasks);

      const res = await request(app)
        .get("/tasks?projectId=project1")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(200);
      expect(Task.find).toHaveBeenCalledWith(
        expect.objectContaining({ projectId: "project1" }),
      );
    });

    it("should filter tasks by sprintId", async () => {
      const mockTasks = [
        { _id: "task1", title: "Task 1", sprintId: "sprint1" },
      ];
      (Task.find as jest.Mock).mockResolvedValue(mockTasks);

      const res = await request(app)
        .get("/tasks?sprintId=sprint1")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(200);
      expect(Task.find).toHaveBeenCalledWith(
        expect.objectContaining({ sprintId: "sprint1" }),
      );
    });

    it("should require authentication", async () => {
      const res = await request(app).get("/tasks");

      expect(res.status).toBe(401);
    });
  });

  describe("POST /tasks/:id/ai/summarize", () => {
    it("should return AI summary", async () => {
      const mockTask = {
        _id: "task123",
        title: "Task Title",
        description: "Task desc",
      };
      (Task.findById as jest.Mock).mockResolvedValue(mockTask);

      const res = await request(app)
        .post("/tasks/task123/ai/summarize")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(200);
      expect(res.body.result).toBeDefined();
    });

    it("should return 404 for non-existent task", async () => {
      (Task.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post("/tasks/nonexistent/ai/summarize")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(404);
    });

    it("should require authentication", async () => {
      const res = await request(app).post("/tasks/task123/ai/summarize");

      expect(res.status).toBe(401);
    });
  });

  describe("POST /tasks/:id/ai/subtasks", () => {
    it("should return AI subtask suggestions", async () => {
      const res = await request(app)
        .post("/tasks/task123/ai/subtasks")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(200);
      expect(res.body.result).toBeDefined();
      expect(res.body.result).toContain("Suggested subtasks");
    });

    it("should require authentication", async () => {
      const res = await request(app).post("/tasks/task123/ai/subtasks");

      expect(res.status).toBe(401);
    });
  });

  describe("POST /tasks/:id/ai/priority", () => {
    it("should return AI priority recommendation", async () => {
      const res = await request(app)
        .post("/tasks/task123/ai/priority")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(200);
      expect(res.body.result).toBeDefined();
      expect(res.body.result).toContain("Recommendation");
    });

    it("should require authentication", async () => {
      const res = await request(app).post("/tasks/task123/ai/priority");

      expect(res.status).toBe(401);
    });
  });

  describe("Projects CRUD", () => {
    it("should list projects for user", async () => {
      const mockProjects = [{ _id: "project1", name: "Project 1" }];

      (Project.find as jest.Mock).mockResolvedValue(mockProjects);

      const res = await request(app)
        .get("/projects")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(200);
    });

    it("should create project as Admin or PM", async () => {
      (jwt.verify as jest.Mock).mockReturnValue(mockPM);

      const newProject = {
        _id: "project1",
        name: "New Project",
        ownerId: mockPM.email,
      };
      (Project.create as jest.Mock).mockResolvedValue(newProject);

      const res = await request(app)
        .post("/projects")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({ name: "New Project" });

      expect(res.status).toBe(201);
    });

    it("should prevent non-admin/PM from creating projects", async () => {
      (jwt.verify as jest.Mock).mockReturnValue(mockMember);

      const res = await request(app)
        .post("/projects")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({ name: "New Project" });

      expect(res.status).toBe(403);
    });

    it("should update project as owner", async () => {
      const mockProject = {
        _id: "project1",
        name: "Old Name",
        ownerId: mockAdmin.email,
        save: jest.fn().mockResolvedValue(true),
      };

      (Project.findById as jest.Mock).mockResolvedValue(mockProject);

      const res = await request(app)
        .patch("/projects/project1")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({ name: "New Name" });

      expect(res.status).toBe(200);
    });
  });

  describe("Sprints CRUD", () => {
    it("should list sprints", async () => {
      const mockSprints = [{ _id: "sprint1", name: "Sprint 1" }];
      (Sprint.find as jest.Mock).mockResolvedValue(mockSprints);

      const res = await request(app)
        .get("/sprints")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(res.status).toBe(200);
    });

    it("should get sprint by ID", async () => {
      const mockSprint = { _id: "sprint1", name: "Sprint 1" };
      (Sprint.findById as jest.Mock).mockResolvedValue(mockSprint);

      const res = await request(app).get("/sprints/sprint1");

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Sprint 1");
    });

    it("should return 404 for non-existent sprint", async () => {
      (Sprint.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get("/sprints/nonexistent");

      expect(res.status).toBe(404);
    });

    it("should create sprint as Admin/PM", async () => {
      const mockProject = { _id: "project1" };
      const newSprint = {
        _id: "sprint1",
        name: "New Sprint",
        projectId: "project1",
      };

      (Project.findById as jest.Mock).mockResolvedValue(mockProject);
      (Sprint.create as jest.Mock).mockResolvedValue(newSprint);

      const res = await request(app)
        .post("/sprints")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({ name: "New Sprint", projectId: "project1" });

      expect(res.status).toBe(201);
    });

    it("should return 404 if project not found for sprint creation", async () => {
      (Project.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post("/sprints")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({ name: "New Sprint", projectId: "nonexistent" });

      expect(res.status).toBe(404);
    });
  });
});
