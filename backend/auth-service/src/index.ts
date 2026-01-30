import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jwt-simple";
import dotenv from "dotenv";
import { z } from "zod";
import { User } from "./models/User";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/workstation-auth";
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key";

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Auth service connected to MongoDB");
    // Seed demo users - Always ensure they have the correct password
    try {
      const hashedPassword = await bcrypt.hash("We@reDev9", 10);
      const seedUsers = [
        {
          _id: "69ea29d1ef44aeef6ac41a51",
          name: "Sanket K",
          email: "sanket@workstation.app",
          password: hashedPassword,
          role: "Admin",
          team: ["Alpha", "Beta"],
        },
        {
          name: "Vyom K",
          email: "vyom@workstation.app",
          password: hashedPassword,
          role: "Admin",
          team: [],
        },
        {
          name: "John Doe",
          email: "john@workstation.app",
          password: hashedPassword,
          role: "Project Manager",
          team: ["Alpha"],
        },
        {
          name: "Jane Smith",
          email: "jane@workstation.app",
          password: hashedPassword,
          role: "Project Manager",
          team: ["Beta"],
        },
        {
          name: "Lina Chen",
          email: "lina@workstation.app",
          password: hashedPassword,
          role: "Developer",
          team: ["Alpha"],
        },
        {
          name: "Marcus Patel",
          email: "marcus@workstation.app",
          password: hashedPassword,
          role: "Developer",
          team: ["Alpha"],
        },
        {
          name: "David Kim",
          email: "david@workstation.app",
          password: hashedPassword,
          role: "Developer",
          team: ["Alpha"],
        },
        {
          name: "Emma Watson",
          email: "emma@workstation.app",
          password: hashedPassword,
          role: "Developer",
          team: ["Beta"],
        },
        {
          name: "Lucas Lee",
          email: "lucas@workstation.app",
          password: hashedPassword,
          role: "Developer",
          team: ["Beta"],
        },
        {
          name: "Sophia Garcia",
          email: "sophia@workstation.app",
          password: hashedPassword,
          role: "Developer",
          team: [],
        },
      ];

      for (const u of seedUsers) {
        await User.findOneAndUpdate(
          { email: u.email },
          { $set: { ...u, password: hashedPassword } },
          { upsert: true, new: true },
        );
      }
      console.log(
        "Successfully seeded/updated 10 standard users with We@reDev9",
      );
    } catch (seedErr) {
      console.error("Error seeding default users:", seedErr);
    }
  })
  .catch((err) => {
    console.error("Failed to connect to Mongo", err);
  });

// Schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2),
});

// Middleware
interface AuthenticatedRequest extends express.Request {
  user?: { id: string; email: string };
}

const authenticate = async (
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.decode(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Admin",
    });

    // Auto-populate team with self for new org owner
    user.team = [user.name];
    await user.save();

    const token = jwt.encode(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
    );
    res.status(201).json({ token });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Validation Error" });
  }
});

app.post("/users", authenticate, async (req: any, res) => {
  try {
    // RBAC: Only Admin can create users
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password || "We@reDev9", 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "Developer",
    });

    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.encode(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
    );
    res.status(200).json({ token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/google", async (req, res) => {
  const { googleId, name, email } = req.body;
  if (!email || !googleId)
    return res.status(400).json({ error: "Missing google profile data" });

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      googleId,
      team: [name],
      role: "Developer",
    });
  }
  const token = jwt.encode(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
  );
  res.status(200).json({ token });
});

app.get("/me", authenticate, async (req: any, res: any) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.status(200).json(user);
});

app.patch("/me", authenticate, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (req.body.name) user.name = req.body.name;
    if (req.body.bio !== undefined) user.bio = req.body.bio;

    await user.save();
    res.status(200).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch("/me/settings", authenticate, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.settings = { ...user.settings, ...req.body };
    await user.save();
    res.status(200).json(user.settings);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: List all users
app.get("/users", authenticate, async (req: any, res) => {
  try {
    // RBAC: Only Admin can list all users
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get single user by ID
app.get("/users/:id", authenticate, async (req: any, res) => {
  try {
    // RBAC: Only Admin can view user details
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update user
app.patch("/users/:id", authenticate, async (req: any, res) => {
  try {
    // RBAC: Only Admin can update users
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Allowed fields to update
    const { name, email, role, bio, team, settings } = req.body;

    if (name) user.name = name;
    if (email) {
      // Check for duplicate email (if changing email)
      if (email !== user.email) {
        const existing = await User.findOne({ email });
        if (existing) {
          return res.status(409).json({ error: "Email already in use" });
        }
      }
      user.email = email;
    }
    if (role) user.role = role;
    if (bio !== undefined) user.bio = bio;
    if (team !== undefined) user.team = team;
    if (settings !== undefined)
      user.settings = { ...user.settings, ...settings };

    await user.save();
    res.status(200).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Delete user
app.delete("/users/:id", authenticate, async (req: any, res) => {
  try {
    // RBAC: Only Admin can delete users
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Reset user password
app.post("/users/:id/reset-password", authenticate, async (req: any, res) => {
  try {
    // RBAC: Only Admin can reset passwords
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "Auth service is running" });
});

app.listen(PORT, () => {
  console.log(`Auth Service listening on port ${PORT}`);
});
