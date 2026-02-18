import { Task, User, AnalyticsSummary } from "@/types";

const baseUrl = typeof window === "undefined"
  ? (process.env.API_BASE_URL || "http://api-gateway:4000")
  : (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000");

const jsonHeaders = {
  "Content-Type": "application/json",
};

async function fetcher<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...jsonHeaders,
      ...(options.headers as Record<string, string>),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "API request failed");
  }

  // Handle 204 No Content responses (e.g., DELETE)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function loginUser(credentials: {
  email: string;
  password: string;
}) {
  const data = await fetcher<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  return data.token;
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}) {
  const data = await fetcher<{ token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.token;
}

export async function getDashboardData(token?: string) {
  const [user, tasks] = await Promise.all([
    fetcher<User>("/auth/me", { method: "GET" }, token),
    fetcher<Task[]>("/tasks", { method: "GET" }, token),
  ]);
  return { user: { ...user, team: user.team ?? [] }, tasks };
}

export async function getTasks(token?: string) {
  return fetcher<Task[]>("/tasks", { method: "GET" }, token);
}

export async function getAnalyticsSummary(token?: string) {
  return fetcher<AnalyticsSummary>(
    "/analytics/summary",
    { method: "GET" },
    token,
  );
}

export async function getUserProfile(token?: string) {
  return fetcher<User>("/auth/me", { method: "GET" }, token);
}

export async function getTaskDetail(id: string, token?: string) {
  return fetcher<Task>(`/tasks/${id}`, { method: "GET" }, token);
}

export async function updateTaskStatus(id: string, status: string, token?: string) {
  return fetcher(`/tasks/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }, token);
}

export async function updateTaskApi(task: Task, token?: string) {
  return fetcher(`/tasks/${task.id}`, {
    method: "PUT",
    body: JSON.stringify(task),
  }, token);
}

export async function createTaskApi(task: Partial<Task>, token?: string) {
  return fetcher(`/tasks`, {
    method: "POST",
    body: JSON.stringify(task),
  }, token);
}

export async function deleteTask(id: string, token?: string) {
  return fetcher(`/tasks/${id}`, {
    method: "DELETE",
  }, token);
}

// Project Management
export async function getProjects(token?: string) {
  return fetcher<any[]>("/projects", { method: "GET" }, token);
}

export async function createProject(project: any, token?: string) {
  return fetcher("/projects", {
    method: "POST",
    body: JSON.stringify(project),
  }, token);
}

export async function updateProject(id: string, project: any, token?: string) {
  return fetcher(`/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(project),
  }, token);
}

export async function addProjectMember(id: string, email: string, token?: string) {
  return fetcher(`/projects/${id}/members`, {
    method: "POST",
    body: JSON.stringify({ email }),
  }, token);
}

export async function removeProjectMember(id: string, email: string, token?: string) {
  return fetcher(`/projects/${id}/members/${email}`, {
    method: "DELETE",
  }, token);
}

// Sprint Management
export async function getSprints(projectId?: string, token?: string) {
  return fetcher<any[]>("/sprints" + (projectId ? `?projectId=${projectId}` : ""), { method: "GET" }, token);
}

export async function createSprint(sprint: any, token?: string) {
  return fetcher("/sprints", {
    method: "POST",
    body: JSON.stringify(sprint),
  }, token);
}

export async function updateSprint(id: string, sprint: any, token?: string) {
  return fetcher(`/sprints/${id}`, {
    method: "PATCH",
    body: JSON.stringify(sprint),
  }, token);
}

// Admin User Management
export async function createSystemUser(user: any, token?: string) {
  return fetcher("/auth/users", {
    method: "POST",
    body: JSON.stringify(user),
  }, token);
}

export async function getUsers(token?: string) {
  return fetcher<User[]>("/auth/users", { method: "GET" }, token);
}

export async function getUserById(id: string, token?: string) {
  return fetcher<User>(`/auth/users/${id}`, { method: "GET" }, token);
}

export async function updateUser(id: string, userData: any, token?: string) {
  return fetcher<User>(`/auth/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(userData),
  }, token);
}

export async function deleteUser(id: string, token?: string) {
  return fetcher(`/auth/users/${id}`, {
    method: "DELETE",
  }, token);
}

export async function resetUserPassword(id: string, password: string, token?: string) {
  return fetcher(`/auth/users/${id}/reset-password`, {
    method: "POST",
    body: JSON.stringify({ password }),
  }, token);
}

export async function suggestTaskAction(
  taskId: string,
  action: "summarize" | "subtasks" | "priority",
  token?: string,
) {
  return fetcher<{ result: string }>(
    `/tasks/${taskId}/ai/${action}`,
    {
      method: "POST",
    },
    token,
  ).then((response) => response.result);
}

// Notification Management
export async function getNotifications(token?: string) {
  return fetcher<any[]>("/notifications", { method: "GET" }, token);
}

export async function markNotificationRead(id: string, token?: string) {
  return fetcher(`/notifications/${id}/read`, { method: "PATCH" }, token);
}

export async function deleteNotification(id: string, token?: string) {
  return fetcher(`/notifications/${id}`, { method: "DELETE" }, token);
}

export async function updateUserSettings(settings: any, token?: string) {
  return fetcher("/auth/me/settings", {
    method: "PATCH",
    body: JSON.stringify(settings),
  }, token);
}

export async function updateUserProfile(profile: any, token?: string) {
  return fetcher("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(profile),
  }, token);
}
