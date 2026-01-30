import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { createClient } from "redis";
import OpenAI from "openai";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { Task } from "./models/Task";
import { Project } from "./models/Project";
import { Sprint } from "./models/Sprint";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/workstation-tasks";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key";

app.use(cors());
app.use(express.json());

const redisClient = createClient({ url: REDIS_URL });
const pubSubClient = createClient({ url: REDIS_URL });

Promise.all([
  redisClient.connect(),
  pubSubClient.connect(),
  mongoose.connect(MONGO_URI),
])
  .then(async () => {
    console.log("Task Service connected to Redis & MongoDB");
    // Seed demo data
    try {
      const projectCount = await Project.countDocuments();
      if (projectCount === 0) {
        // 1. PROJECTS
        const mobileApp = await Project.create({
          name: "Mobile App Redesign",
          teamObjective:
            "Modernize the user interface and improve performance for the flagship iOS/Android application.",
          details: "Focus on dark mode support and a11y compliance.",
          ownerId: "sanket@workstation.app",
          members: [
            "sanket@workstation.app",
            "john@workstation.app",
            "lina@workstation.app",
            "marcus@workstation.app",
          ],
        });

        const cloudMigration = await Project.create({
          name: "Cloud Migration Phase 2",
          teamObjective:
            "Migrate heritage monolithic services to AWS EKS clusters.",
          details: "Reduce hosting costs by 30% through containerization.",
          ownerId: "vyom@workstation.app",
          members: [
            "vyom@workstation.app",
            "jane@workstation.app",
            "david@workstation.app",
          ],
        });

        // 2. SPRINTS
        const mobileSprint = await Sprint.create({
          name: "Alpha Sprint 1",
          projectId: mobileApp._id,
          startDate: new Date().toISOString(),
          endDate: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          status: "active",
        });

        const cloudSprint = await Sprint.create({
          name: "Infrastucture Q2",
          projectId: cloudMigration._id,
          startDate: new Date().toISOString(),
          endDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          status: "active",
        });

        // 3. TASKS
        const demoTasks = [
          {
            title: "Setup Linter and Formatters",
            description:
              "Initialize ESLint and Prettier for the new frontend repository.",
            status: "done",
            priority: "low",
            assignee: "Lina Chen",
            dueDate: new Date().toISOString().split("T")[0],
            project: mobileApp.name,
            projectId: mobileApp._id,
          },
          {
            title: "Implement Dark Mode Theme",
            description: "Create the Tailwind CSS theme for dark mode support.",
            status: "inprogress",
            priority: "high",
            assignee: "Marcus Patel",
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            project: mobileApp.name,
            projectId: mobileApp._id,
            sprintId: mobileSprint._id,
          },
          {
            title: "Fix Navigation Lag",
            description:
              "Identify and resolve the bottleneck in the main navigation transitions.",
            status: "todo",
            priority: "medium",
            assignee: "David Kim",
            dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0], // Overdue
            project: mobileApp.name,
            projectId: mobileApp._id,
            sprintId: mobileSprint._id,
          },
          {
            title: "Configure VPC Peering",
            description:
              "Setup peering between production and staging legacy VPCs.",
            status: "todo",
            priority: "high",
            assignee: "Jane Smith",
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            project: cloudMigration.name,
            projectId: cloudMigration._id,
            sprintId: cloudSprint._id,
          },
          {
            title: "Security Patch 1.4.2",
            description: "Apply critical patches to the load balancer configs.",
            status: "todo",
            priority: "high",
            assignee: "Vyom K",
            dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0], // Overdue
            project: cloudMigration.name,
            projectId: cloudMigration._id,
          },
        ];
        await Task.insertMany(demoTasks);
        console.log("Successfully seeded 2 Projects, 2 Sprints, and 5 Tasks");
      }
    } catch (err) {
      console.error("Error seeding demo tasks:", err);
    }
  })
  .catch(console.error);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy" });
const isAIFeaturesEnabled = process.env.ENABLE_AI_FEATURES === "true";

const aiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 50,
  message: { error: "Daily limit for AI requests exceeded (50 calls/day)." },
});

const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const invalidateCache = async (key: string = "all_tasks") => {
  await redisClient.del(key);
};

const emitEvent = (eventType: string, payload: any) => {
  pubSubClient.publish(eventType, JSON.stringify(payload));
};

// --- PROJECTS ---
const projectRouter = express.Router();
projectRouter.use(authenticate);

projectRouter.get("/", async (req: any, res) => {
  try {
    // RBAC: Can only see projects they are a developer of or own
    const projects = await Project.find({
      $or: [{ ownerId: req.user.email }, { members: req.user.email }],
    });
    res.status(200).json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

projectRouter.post("/", async (req: any, res) => {
  try {
    if (req.user.role !== "Admin" && req.user.role !== "Project Manager") {
      return res
        .status(403)
        .json({ error: "Only Admins or Project Managers can create projects" });
    }
    const project = await Project.create({
      ...req.body,
      ownerId: req.user.email,
    });
    res.status(201).json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

projectRouter.patch("/:id", async (req: any, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (req.user.role !== "Admin" && project.ownerId !== req.user.email) {
      return res.status(403).json({
        error: "Only Admin or Project Owner can update project details",
      });
    }

    Object.assign(project, req.body);
    await project.save();
    res.status(200).json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

projectRouter.post("/:id/members", async (req: any, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (req.user.role !== "Admin" && project.ownerId !== req.user.email) {
      return res
        .status(403)
        .json({ error: "Only Admin or Project Owner can manage members" });
    }

    if (!project.members.includes(email)) {
      project.members.push(email);
      await project.save();
    }
    res.status(200).json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

projectRouter.delete("/:id/members/:email", async (req: any, res) => {
  try {
    const { email } = req.params;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (req.user.role !== "Admin" && project.ownerId !== req.user.email) {
      return res
        .status(403)
        .json({ error: "Only Admin or Project Owner can manage members" });
    }

    project.members = project.members.filter((m) => m !== email);
    await project.save();
    res.status(200).json(project);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- SPRINTS ---
const sprintRouter = express.Router();
sprintRouter.use(authenticate);

sprintRouter.get("/", async (req: any, res) => {
  try {
    // Basic Sprint fetching
    const sprints = await Sprint.find(
      req.query.projectId ? { projectId: req.query.projectId } : {},
    );
    res.status(200).json(sprints);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

sprintRouter.post("/", async (req: any, res) => {
  try {
    const project = await Project.findById(req.body.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (req.user.role !== "Admin" && project.ownerId !== req.user.email) {
      return res
        .status(403)
        .json({ error: "Only Admin or Project Owner can create sprints" });
    }
    const sprint = await Sprint.create(req.body);
    res.status(201).json(sprint);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

sprintRouter.get("/:id", async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });
    res.status(200).json(sprint);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

sprintRouter.patch("/:id", async (req: any, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ error: "Sprint not found" });

    const project = await Project.findById(sprint.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (req.user.role !== "Admin" && project.ownerId !== req.user.email) {
      return res
        .status(403)
        .json({ error: "Only Admin or Project Owner can update sprints" });
    }

    Object.assign(sprint, req.body);
    await sprint.save();
    res.status(200).json(sprint);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- TASKS ---
const taskRouter = express.Router();

const taskSchemaBody = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(["todo", "inprogress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assignee: z.string(),
  dueDate: z.string(),
  project: z.string().optional(),
  projectId: z.string().optional(),
  sprintId: z.string().optional(),
  subtasks: z.array(z.string()).optional(),
});

taskRouter.get("/", authenticate, async (req: any, res) => {
  try {
    const query: any = {};
    if (req.query.projectId) {
      query.projectId = req.query.projectId;
    } else if (req.query.sprintId) {
      query.sprintId = req.query.sprintId;
    } else {
      // RBAC: Can only see tasks for projects they are a developer of or own
      const userProjects = await Project.find({
        $or: [{ ownerId: req.user.email }, { members: req.user.email }],
      });
      const projectIds = userProjects.map((p) => p._id.toString());
      query.$or = [{ projectId: { $in: projectIds } }, { project: "General" }];
    }

    const tasks = await Task.find(query);
    res.status(200).json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

taskRouter.post("/", authenticate, async (req: any, res) => {
  try {
    const parsed = taskSchemaBody.parse(req.body);
    const task = await Task.create(parsed);
    await invalidateCache();
    emitEvent("task.created", task);
    res.status(201).json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

taskRouter.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(200).json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

taskRouter.put("/:id", authenticate, async (req, res) => {
  try {
    const parsed = taskSchemaBody.partial().parse(req.body);
    const task = await Task.findByIdAndUpdate(req.params.id, parsed, {
      new: true,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    await invalidateCache();
    emitEvent("task.updated", task);
    res.status(200).json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

taskRouter.patch("/:id/status", authenticate, async (req: any, res) => {
  try {
    if (!req.body.status)
      return res.status(400).json({ error: "Status is required" });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Check if task belongs to a completed sprint (Read-only mode)
    if (task.sprintId) {
      const sprint = await Sprint.findById(task.sprintId);
      if (sprint && sprint.status === "completed") {
        return res
          .status(403)
          .json({ error: "Tasks in completed sprints (scrums) are read-only" });
      }
    }

    task.status = req.body.status;
    await task.save();

    await invalidateCache();
    emitEvent("task.updated", task);
    res.status(200).json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

taskRouter.delete("/:id", authenticate, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    await invalidateCache();
    emitEvent("task.deleted", { id: req.params.id });
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Endpoints
taskRouter.post(
  "/:id/ai/summarize",
  authenticate,
  aiLimiter,
  async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ error: "Task not found" });
      res.status(200).json({
        result: "Summary for " + task.title + ": " + task.description,
      });
    } catch (err: any) {
      res.status(500).json({ error: "AI unavailable" });
    }
  },
);

taskRouter.post(
  "/:id/ai/subtasks",
  authenticate,
  aiLimiter,
  async (req, res) => {
    try {
      res
        .status(200)
        .json({ result: "Suggested subtasks: Review goals, finalize spec." });
    } catch (err: any) {
      res.status(500).json({ error: "AI unavailable" });
    }
  },
);

taskRouter.post(
  "/:id/ai/priority",
  authenticate,
  aiLimiter,
  async (req, res) => {
    try {
      res.status(200).json({ result: "Recommendation: medium" });
    } catch (err: any) {
      res.status(500).json({ error: "AI unavailable" });
    }
  },
);

app.use("/projects", projectRouter);
app.use("/sprints", sprintRouter);
app.use("/tasks", taskRouter);
// Fallback for API gateway if path isn't perfectly mapped
app.use("/", taskRouter);

app.listen(PORT, () => console.log(`Task Service listening on port ${PORT}`));
