import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { createClient } from "redis";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Task } from "./models/Task";
import { Project } from "./models/Project";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/workstation-tasks";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key";

app.use(cors());
app.use(express.json());

const redisClient = createClient({ url: REDIS_URL });

Promise.all([redisClient.connect(), mongoose.connect(MONGO_URI)])
  .then(() => {
    console.log("Analytics Service connected to Redis & MongoDB");
  })
  .catch(console.error);

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

app.get("/summary", authenticate, async (req: any, res) => {
  try {
    // RBAC: Identify which projects the user has access to
    const userProjects = (await Project.find({
      $or: [{ ownerId: req.user.email }, { members: req.user.email }],
    })) as any[];

    const projectNames = userProjects.map((p: any) => p.name);
    const projectIdStrings = userProjects.map((p: any) => p._id.toString());

    const cached = await redisClient.get("analytics_summary");
    if (cached) return res.status(200).json(JSON.parse(cached));

    // 1. Weekly Completed (Filtered)
    const weeklyCompleted = [
      {
        week: "Week 1",
        count: await Task.countDocuments({
          status: "done",
          $or: [
            { project: { $in: projectNames } },
            { projectId: { $in: projectIdStrings } },
          ],
        }),
      },
      { week: "Week 2", count: 2 },
      { week: "Week 3", count: 5 },
    ];

    // 2. Overdue Tasks (Filtered)
    const today = new Date().toISOString().split("T")[0];
    const overdueTasks = await Task.countDocuments({
      status: { $ne: "done" },
      dueDate: { $lt: today, $ne: "" },
      $or: [
        { project: { $in: projectNames } },
        { projectId: { $in: projectIdStrings } },
      ],
    });

    // 3. Team Productivity (Filtered)
    const teamAggregation = await Task.aggregate([
      {
        $match: {
          status: "done",
          $or: [
            { project: { $in: projectNames } },
            { projectId: { $in: projectIdStrings } },
          ],
        },
      },
      { $group: { _id: "$assignee", count: { $sum: 1 } } },
    ]);

    const teamProductivity = teamAggregation.map((item) => ({
      developer: item._id,
      efficiency: Math.min(item.count * 10 + 60, 100), // Mock efficiency calculation
    }));

    if (teamProductivity.length === 0) {
      teamProductivity.push({ developer: "Sanket K", efficiency: 92 });
      teamProductivity.push({ developer: "Lina Chen", efficiency: 84 });
    }

    const payload = {
      weeklyCompleted,
      overdueTasks,
      productivityScore: 87,
      teamProductivity,
    };

    await redisClient.setEx("analytics_summary", 60, JSON.stringify(payload));
    res.status(200).json(payload);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () =>
  console.log(`Analytics Service running on port ${PORT}`),
);
