import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4005;
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongodb:27017/workstation";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// MongoDB Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ["info", "success", "message", "warning"], default: "info" },
  unread: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);

// Middleware to verify JWT
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Routes
app.get("/notifications", authenticate, async (req: any, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/notifications/:id/read", authenticate, async (req: any, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.id, userId: req.user.id },
      { unread: false },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/notifications/:id", authenticate, async (req: any, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin endpoint to seed or create notifications
app.post("/notifications", async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Seed Initial Data function
async function seedData() {
  const count = await Notification.countDocuments();
  if (count === 0) {
    console.log("Seeding initial notifications...");
    const userId = "69ea29d1ef44aeef6ac41a51"; // Default test user ID from logs
    const initialNotifs = [
      {
        userId,
        title: "System Synchronization Complete",
        description: "The workstation cluster 'NODE_ALPHA' has been successfully balanced.",
        type: "success",
        unread: true,
      },
      {
        userId,
        title: "Security Protocol Update",
        description: "Multi-factor authentication (MFA) is now required for all Admin operations.",
        type: "warning",
        unread: true,
      },
      {
        userId,
        title: "Telemetry Influx",
        description: "Unusually high traffic detected on the API Gateway. Monitoring active.",
        type: "info",
        unread: false,
      },
      {
        userId,
        title: "Operator Message",
        description: "Sarah: 'The new dark mode contrast looks much better. Ready for deployment.'",
        type: "message",
        unread: false,
      }
    ];
    await Notification.insertMany(initialNotifs);
    console.log("Seeded 4 notifications.");
  }
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB (Notification Service)");
    seedData();
    app.listen(PORT, () => {
      console.log(`Notification Service running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("Could not connect to MongoDB", err));
