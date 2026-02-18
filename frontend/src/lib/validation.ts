import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = loginSchema
  .extend({
    name: z.string().min(2, "Enter your full name"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const taskSchema = z.object({
  id: z.string().uuid({ message: "Task id must be valid" }),
  title: z.string().min(3, "Add a short title for the task"),
  description: z.string().min(10, "Add a task description"),
  status: z.enum(["todo", "inprogress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  assignee: z.string().min(2, "Choose a team developer"),
  dueDate: z.string().min(8, "Choose a due date"),
  project: z.string().min(2, "Select a project"),
  subtasks: z.array(z.string()).optional(),
});
