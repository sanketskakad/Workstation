import request from "supertest";
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));
jest.mock("mongoose", () => {
  const mmongoose = {
    connect: jest.fn().mockResolvedValue(true),
    connection: {
      readyState: 0,
    },
  };
  return mmongoose;
});
import { app } from "../index";
import { User } from "../models/User";
import * as bcrypt from "bcrypt";
import jwt from "jwt-simple";

jest.mock("../models/User");
jest.mock("bcrypt");
jest.mock("jwt-simple");

describe("Auth Service Unit Tests", () => {
  const JWT_SECRET = "super-secret-jwt-key";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /health", () => {
    it("should return 200 and health status", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("Auth service is running");
    });
  });

  describe("POST /login", () => {
    it("should return 200 and token for valid credentials", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: "hashedpassword",
        role: "Admin",
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.encode as jest.Mock).mockReturnValue("mocktoken");

      const res = await request(app)
        .post("/login")
        .send({ email: "test@example.com", password: "We@reDev9" });

      expect(res.status).toBe(200);
      expect(res.body.token).toBe("mocktoken");
    });

    it("should return 401 for invalid credentials", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post("/login")
        .send({ email: "wrong@example.com", password: "We@reDev9" });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid credentials");
    });

    it("should return 401 when password mismatch", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: "hashedpassword",
        role: "Admin",
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const res = await request(app)
        .post("/login")
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid credentials");
    });

    it("should return 401 when user has no password", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: null,
        role: "Admin",
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .post("/login")
        .send({ email: "test@example.com", password: "We@reDev9" });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid credentials");
    });

    it("should return 400 for invalid email format", async () => {
      const res = await request(app)
        .post("/login")
        .send({ email: "invalid-email", password: "We@reDev9" });

      expect(res.status).toBe(400);
    });

    it("should return 400 for short password", async () => {
      const res = await request(app)
        .post("/login")
        .send({ email: "test@example.com", password: "short" });

      expect(res.status).toBe(400);
    });

    it("should handle bcrypt comparison error gracefully", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: "hashedpassword",
        role: "Admin",
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockRejectedValue(
        new Error("bcrypt error"),
      );

      const res = await request(app)
        .post("/login")
        .send({ email: "test@example.com", password: "We@reDev9" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /register", () => {
    it("should create a new user and return 201", async () => {
      const mockUser = {
        _id: "newuser",
        email: "new@example.com",
        name: "New User",
        role: "Admin",
        team: [],
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.encode as jest.Mock).mockReturnValue("newtoken");

      const res = await request(app)
        .post("/register")
        .send({
          name: "New User",
          email: "new@example.com",
          password: "We@reDev9",
        });

      expect(res.status).toBe(201);
      expect(res.body.token).toBe("newtoken");
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should return 409 for duplicate email", async () => {
      (User.findOne as jest.Mock).mockResolvedValue({
        email: "existing@example.com",
      });

      const res = await request(app)
        .post("/register")
        .send({
          name: "Duplicate User",
          email: "existing@example.com",
          password: "We@reDev9",
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("Email already exists");
    });

    it("should auto-populate team with user name", async () => {
      const mockUser = {
        _id: "newuser",
        email: "new@example.com",
        name: "Test User",
        role: "Admin",
        team: [],
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.encode as jest.Mock).mockReturnValue("newtoken");

      const res = await request(app)
        .post("/register")
        .send({
          name: "Test User",
          email: "new@example.com",
          password: "We@reDev9",
        });

      expect(res.status).toBe(201);
      expect(mockUser.team).toContain("Test User");
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should return 400 for invalid email", async () => {
      const res = await request(app)
        .post("/register")
        .send({
          name: "New User",
          email: "invalid-email",
          password: "We@reDev9",
        });

      expect(res.status).toBe(400);
    });

    it("should return 400 for short password", async () => {
      const res = await request(app)
        .post("/register")
        .send({
          name: "New User",
          email: "new@example.com",
          password: "short",
        });

      expect(res.status).toBe(400);
    });

    it("should return 400 for short name", async () => {
      const res = await request(app)
        .post("/register")
        .send({ name: "A", email: "new@example.com", password: "We@reDev9" });

      expect(res.status).toBe(400);
    });

    it("should handle bcrypt hash error", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error("bcrypt error"));

      const res = await request(app)
        .post("/register")
        .send({
          name: "New User",
          email: "new@example.com",
          password: "We@reDev9",
        });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /users", () => {
    const mockToken = "Bearer mocktoken";

    beforeEach(() => {
      (jwt.decode as jest.Mock).mockReturnValue({
        id: "admin123",
        email: "admin@example.com",
        role: "Admin",
      });
    });

    it("should create a new user as admin", async () => {
      const newUser = {
        _id: "user456",
        email: "newuser@example.com",
        name: "New User",
        role: "Project Manager",
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
      (User.create as jest.Mock).mockResolvedValue(newUser);

      const res = await request(app)
        .post("/users")
        .set("Authorization", mockToken)
        .send({
          name: "New User",
          email: "newuser@example.com",
          password: "Pass123",
          role: "Project Manager",
        });

      expect(res.status).toBe(201);
      expect(res.body.role).toBe("Project Manager");
    });

    it("should return 403 for non-admin user", async () => {
      (jwt.decode as jest.Mock).mockReturnValue({
        id: "member123",
        email: "developer@example.com",
        role: "Developer",
      });

      const res = await request(app)
        .post("/users")
        .set("Authorization", mockToken)
        .send({
          name: "New User",
          email: "newuser@example.com",
          password: "Pass123",
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Access denied. Admin only.");
    });

    it("should return 409 for duplicate email", async () => {
      (User.findOne as jest.Mock).mockResolvedValue({
        email: "existing@example.com",
      });

      const res = await request(app)
        .post("/users")
        .set("Authorization", mockToken)
        .send({
          name: "New User",
          email: "existing@example.com",
          password: "Pass123",
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("Email already exists");
    });

    it("should return 401 without token", async () => {
      const res = await request(app)
        .post("/users")
        .send({
          name: "New User",
          email: "newuser@example.com",
          password: "Pass123",
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Missing token");
    });

    it("should return 401 with invalid token", async () => {
      (jwt.decode as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const res = await request(app)
        .post("/users")
        .set("Authorization", "Bearer invalid")
        .send({
          name: "New User",
          email: "newuser@example.com",
          password: "Pass123",
        });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /me", () => {
    const mockToken = "Bearer mocktoken";

    beforeEach(() => {
      (jwt.decode as jest.Mock).mockReturnValue({
        id: "user123",
        email: "test@example.com",
        role: "Admin",
      });
    });

    it("should fetch current user profile", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        name: "Test User",
        role: "Admin",
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app).get("/me").set("Authorization", mockToken);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe("test@example.com");
      expect(User.findById).toHaveBeenCalledWith("user123");
    });

    it("should return 404 for non-existent user", async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get("/me").set("Authorization", mockToken);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("User not found");
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get("/me");

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Missing token");
    });
  });

  describe("PATCH /me", () => {
    const mockToken = "Bearer mocktoken";

    beforeEach(() => {
      (jwt.decode as jest.Mock).mockReturnValue({
        id: "user123",
        email: "test@example.com",
        role: "Admin",
      });
    });

    it("should update user name", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        name: "Old Name",
        bio: "Old bio",
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .patch("/me")
        .set("Authorization", mockToken)
        .send({ name: "New Name" });

      expect(res.status).toBe(200);
      expect(mockUser.name).toBe("New Name");
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should return 404 for non-existent user", async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .patch("/me")
        .set("Authorization", mockToken)
        .send({ name: "New Name" });

      expect(res.status).toBe(404);
    });

    it("should return 401 without token", async () => {
      const res = await request(app).patch("/me").send({ name: "New Name" });

      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /me/settings", () => {
    const mockToken = "Bearer mocktoken";

    beforeEach(() => {
      (jwt.decode as jest.Mock).mockReturnValue({
        id: "user123",
        email: "test@example.com",
        role: "Admin",
      });
    });

    it("should update user settings", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        name: "Test User",
        settings: { theme: "dark", timezone: "UTC" },
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .patch("/me/settings")
        .set("Authorization", mockToken)
        .send({ theme: "light" });

      expect(res.status).toBe(200);
      expect(mockUser.settings.theme).toBe("light");
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should return 404 for non-existent user", async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .patch("/me/settings")
        .set("Authorization", mockToken)
        .send({ theme: "light" });

      expect(res.status).toBe(404);
    });
  });

  describe("POST /google", () => {
    it("should create user via Google OAuth", async () => {
      const newUser = {
        _id: "googleuser123",
        email: "user@google.com",
        name: "Google User",
        googleId: "googleid123",
        role: "Developer",
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(newUser);
      (jwt.encode as jest.Mock).mockReturnValue("googletoken");

      const res = await request(app)
        .post("/google")
        .send({
          googleId: "googleid123",
          name: "Google User",
          email: "user@google.com",
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBe("googletoken");
    });

    it("should return existing user for repeat Google login", async () => {
      const existingUser = {
        _id: "googleuser123",
        email: "user@google.com",
        name: "Google User",
        googleId: "googleid123",
        role: "Developer",
      };

      (User.findOne as jest.Mock).mockResolvedValue(existingUser);
      (jwt.encode as jest.Mock).mockReturnValue("googletoken");

      const res = await request(app)
        .post("/google")
        .send({
          googleId: "googleid123",
          name: "Google User",
          email: "user@google.com",
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBe("googletoken");
      expect(User.create).not.toHaveBeenCalled();
    });

    it("should return 400 without googleId", async () => {
      const res = await request(app)
        .post("/google")
        .send({ name: "Google User", email: "user@google.com" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Missing google profile data");
    });

    it("should return 400 without email", async () => {
      const res = await request(app)
        .post("/google")
        .send({ googleId: "googleid123", name: "Google User" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Missing google profile data");
    });
  });

  describe("GET /users (Admin: List all users)", () => {
    const mockToken = "Bearer mocktoken";

    beforeEach(() => {
      (jwt.decode as jest.Mock).mockReturnValue({
        id: "admin123",
        email: "admin@example.com",
        role: "Admin",
      });
    });

    it("should list all users as admin", async () => {
      const mockUsers = [
        {
          _id: "user1",
          email: "user1@example.com",
          name: "User 1",
          role: "Developer",
        },
        { _id: "user2", email: "user2@example.com", name: "User 2", role: "Admin" },
      ];

      (User.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUsers),
      });

      const res = await request(app)
        .get("/users")
        .set("Authorization", mockToken);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it("should return 403 for non-admin user", async () => {
      (jwt.decode as jest.Mock).mockReturnValue({
        id: "member123",
        email: "developer@example.com",
        role: "Developer",
      });

      const res = await request(app)
        .get("/users")
        .set("Authorization", mockToken);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Access denied. Admin only.");
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get("/users");

      expect(res.status).toBe(401);
    });
  });

  describe("GET /users/:id (Admin: Get user by ID)", () => {
    const mockToken = "Bearer mocktoken";

    beforeEach(() => {
      (jwt.decode as jest.Mock).mockReturnValue({
        id: "admin123",
        email: "admin@example.com",
        role: "Admin",
      });
    });

    it("should get user by ID as admin", async () => {
      const mockUser = {
        _id: "user123",
        email: "user@example.com",
        name: "User Name",
        role: "Developer",
      };

      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const res = await request(app)
        .get("/users/user123")
        .set("Authorization", mockToken);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe("user@example.com");
    });

    it("should return 404 for non-existent user", async () => {
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .get("/users/nonexistent")
        .set("Authorization", mockToken);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("User not found");
    });

    it("should return 403 for non-admin user", async () => {
      (jwt.decode as jest.Mock).mockReturnValue({
        id: "member123",
        email: "developer@example.com",
        role: "Developer",
      });

      const res = await request(app)
        .get("/users/user123")
        .set("Authorization", mockToken);

      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /users/:id (Admin: Update user)", () => {
    const mockToken = "Bearer mocktoken";

    beforeEach(() => {
      (jwt.decode as jest.Mock).mockReturnValue({
        id: "admin123",
        email: "admin@example.com",
        role: "Admin",
      });
    });

    it("should update user as admin", async () => {
      const mockUser = {
        _id: "user123",
        email: "user@example.com",
        name: "Old Name",
        role: "Developer",
        bio: "Old bio",
        team: [],
        settings: {},
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .patch("/users/user123")
        .set("Authorization", mockToken)
        .send({ name: "New Name", role: "Admin" });

      expect(res.status).toBe(200);
      expect(mockUser.name).toBe("New Name");
      expect(mockUser.role).toBe("Admin");
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should prevent duplicate email", async () => {
      const mockUser = {
        _id: "user123",
        email: "user@example.com",
        name: "User Name",
        role: "Developer",
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (User.findOne as jest.Mock).mockResolvedValue({
        email: "newemail@example.com",
      });

      const res = await request(app)
        .patch("/users/user123")
        .set("Authorization", mockToken)
        .send({ email: "newemail@example.com" });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("Email already in use");
    });

    it("should return 404 for non-existent user", async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .patch("/users/nonexistent")
        .set("Authorization", mockToken)
        .send({ name: "New Name" });

      expect(res.status).toBe(404);
    });

    it("should return 403 for non-admin user", async () => {
      (jwt.decode as jest.Mock).mockReturnValue({
        id: "member123",
        email: "developer@example.com",
        role: "Developer",
      });

      const res = await request(app)
        .patch("/users/user123")
        .set("Authorization", mockToken)
        .send({ name: "New Name" });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /users/:id (Admin: Delete user)", () => {
    const mockToken = "Bearer mocktoken";

    beforeEach(() => {
      (jwt.decode as jest.Mock).mockReturnValue({
        id: "admin123",
        email: "admin@example.com",
        role: "Admin",
      });
    });

    it("should delete user as admin", async () => {
      const mockUser = { _id: "user123", email: "user@example.com" };

      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .delete("/users/user123")
        .set("Authorization", mockToken);

      expect(res.status).toBe(204);
    });

    it("should return 404 for non-existent user", async () => {
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .delete("/users/nonexistent")
        .set("Authorization", mockToken);

      expect(res.status).toBe(404);
    });

    it("should return 403 for non-admin user", async () => {
      (jwt.decode as jest.Mock).mockReturnValue({
        id: "member123",
        email: "developer@example.com",
        role: "Developer",
      });

      const res = await request(app)
        .delete("/users/user123")
        .set("Authorization", mockToken);

      expect(res.status).toBe(403);
    });
  });

  describe("POST /users/:id/reset-password (Admin: Reset password)", () => {
    const mockToken = "Bearer mocktoken";

    beforeEach(() => {
      (jwt.decode as jest.Mock).mockReturnValue({
        id: "admin123",
        email: "admin@example.com",
        role: "Admin",
      });
    });

    it("should reset user password as admin", async () => {
      const mockUser = {
        _id: "user123",
        email: "user@example.com",
        password: "oldhash",
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue("newhash");

      const res = await request(app)
        .post("/users/user123/reset-password")
        .set("Authorization", mockToken)
        .send({ password: "newWe@reDev9" });

      expect(res.status).toBe(200);
      expect(mockUser.password).toBe("newhash");
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should return 400 without password", async () => {
      const res = await request(app)
        .post("/users/user123/reset-password")
        .set("Authorization", mockToken)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Password is required");
    });

    it("should return 404 for non-existent user", async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post("/users/user123/reset-password")
        .set("Authorization", mockToken)
        .send({ password: "newWe@reDev9" });

      expect(res.status).toBe(404);
    });

    it("should return 403 for non-admin user", async () => {
      (jwt.decode as jest.Mock).mockReturnValue({
        id: "member123",
        email: "developer@example.com",
        role: "Developer",
      });

      const res = await request(app)
        .post("/users/user123/reset-password")
        .set("Authorization", mockToken)
        .send({ password: "newWe@reDev9" });

      expect(res.status).toBe(403);
    });
  });
