const http = require("http");
const { URL } = require("url");

const port = process.env.MOCK_SERVER_PORT || 4000;
const authToken = "mock-token";

const users = [
    {
        id: "user-1",
        name: "Sanket K",
        email: "sanket@workstation.app",
        password: "password1",
        role: "Product Manager",
    },
];

const tasks = [
    {
        id: "task-1",
        title: "Finalize product launch messaging",
        description: "Align the launch narrative with sales and marketing goals.",
        status: "todo",
        priority: "high",
        assignee: "Sanket K",
        dueDate: "2026-05-02",
        project: "Roadmap",
        subtasks: ["Draft messaging deck", "Review with stakeholders"],
    },
    {
        id: "task-2",
        title: "Audit onboarding funnel",
        description: "Analyze where new users drop off and recommend improvements.",
        status: "inprogress",
        priority: "medium",
        assignee: "Sanket K",
        dueDate: "2026-04-28",
        project: "Growth",
        subtasks: ["Collect funnel metrics", "Spot friction points"],
    },
    {
        id: "task-3",
        title: "Prepare team sprint review",
        description: "Summarize completed work and blockers for the sprint demo.",
        status: "done",
        priority: "low",
        assignee: "Lina Chen",
        dueDate: "2026-04-22",
        project: "Execution",
        subtasks: ["Gather sprint metrics", "Create review slides"],
    },
    {
        id: "task-4",
        title: "Prototype onboarding checklist",
        description: "Build a first version of the onboarding checklist for new teams.",
        status: "todo",
        priority: "medium",
        assignee: "Lina Chen",
        dueDate: "2026-05-06",
        project: "Growth",
        subtasks: ["Define checklist steps", "Validate with PM team"],
    },
    {
        id: "task-5",
        title: "Set up CI/CD pipeline",
        description: "Configure GitHub Actions to automate testing and deployment workflows.",
        status: "inprogress",
        priority: "high",
        assignee: "Marcus Patel",
        dueDate: "2026-04-30",
        project: "Roadmap",
        subtasks: ["Write workflow YAML", "Add staging deployment step"],
    },
];

const analytics = {
    weeklyCompleted: [
        { week: "Week 1", count: 3 },
        { week: "Week 2", count: 5 },
        { week: "Week 3", count: 8 },
        { week: "Week 4", count: 6 },
    ],
    overdueTasks: 2,
    productivityScore: 87,
    teamProductivity: [
        { developer: "Sanket K", efficiency: 92 },
        { developer: "Lina Chen", efficiency: 84 },
        { developer: "Marcus Patel", efficiency: 76 },
    ],
    totalTasks: tasks.length,
    completedTasks: tasks.filter((task) => task.status === "done").length,
    activeProjects: [...new Set(tasks.map((task) => task.project))].length,
    velocity: 18,
    burnup: [2, 4, 7, 9, 12, 15, 18],
};

function sendJSON(res, statusCode, payload) {
    const body = JSON.stringify(payload);
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
    });
    res.end(body);
}

function sendNoContent(res) {
    res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
    });
    res.end();
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            if (!body) {
                resolve(null);
                return;
            }

            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(new Error("Invalid JSON body"));
            }
        });
        req.on("error", reject);
    });
}

function getAuthToken(req) {
    const authHeader = req.headers.authorization || "";
    const [type, token] = authHeader.split(" ");
    return type === "Bearer" ? token : null;
}

function authenticate(req, res) {
    const token = getAuthToken(req);
    if (token !== authToken) {
        sendJSON(res, 401, { error: "Unauthorized" });
        return false;
    }
    return true;
}

function handleLogin(req, res, body) {
    const { email, password } = body || {};
    const user = users.find((item) => item.email === email && item.password === password);

    if (!user) {
        sendJSON(res, 401, { error: "Invalid credentials" });
        return;
    }

    sendJSON(res, 200, { token: authToken });
}

function handleRegister(req, res, body) {
    const { name, email, password } = body || {};
    if (!name || !email || !password) {
        sendJSON(res, 400, { error: "Missing registration fields" });
        return;
    }

    if (users.some((item) => item.email === email)) {
        sendJSON(res, 409, { error: "User already exists" });
        return;
    }

    const newUser = {
        id: `user-${users.length + 1}`,
        name,
        email,
        password,
        role: "Developer",
    };
    users.push(newUser);

    sendJSON(res, 201, { token: authToken });
}

function handleMe(req, res) {
    const token = getAuthToken(req);
    // Find the user that logged in — fallback to first user
    const user = users.find((u) => token === authToken) ?? users[0];
    sendJSON(res, 200, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: ["Sanket K", "Lina Chen", "Marcus Patel"],
    });
}

function handleTasksList(req, res) {
    sendJSON(res, 200, tasks);
}

function handleTaskDetail(req, res, taskId) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) {
        sendJSON(res, 404, { error: "Task not found" });
        return;
    }
    sendJSON(res, 200, task);
}

function handleUpdateTaskStatus(req, res, taskId, body) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) {
        sendJSON(res, 404, { error: "Task not found" });
        return;
    }
    if (!body || !body.status) {
        sendJSON(res, 400, { error: "Missing status" });
        return;
    }
    task.status = body.status;
    sendJSON(res, 200, task);
}

function handleSaveTask(req, res, taskId, body) {
    if (!body || !body.id || body.id !== taskId) {
        sendJSON(res, 400, { error: "Task ID mismatch" });
        return;
    }

    const index = tasks.findIndex((item) => item.id === taskId);
    if (index === -1) {
        tasks.push(body);
        sendJSON(res, 201, body);
        return;
    }

    tasks[index] = body;
    sendJSON(res, 200, body);
}

function handleDeleteTask(req, res, taskId) {
    const index = tasks.findIndex((item) => item.id === taskId);
    if (index === -1) {
        sendJSON(res, 404, { error: "Task not found" });
        return;
    }
    tasks.splice(index, 1);
    // Return 204 No Content — correct for DELETE
    sendNoContent(res);
}

function handleAnalytics(req, res) {
    // Recompute dynamic fields
    analytics.totalTasks = tasks.length;
    analytics.completedTasks = tasks.filter((t) => t.status === "done").length;
    analytics.overdueTasks = tasks.filter((t) => {
        const due = new Date(t.dueDate);
        return due < new Date() && t.status !== "done";
    }).length;
    sendJSON(res, 200, analytics);
}

function handleTaskAiAction(req, res, taskId, action) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) {
        sendJSON(res, 404, { error: "Task not found" });
        return;
    }

    const actions = {
        summarize: `Summary: "${task.title}" — ${task.description} (Due: ${task.dueDate}, Priority: ${task.priority})`,
        subtasks: `Suggested subtasks for "${task.title}": 1. Break down requirements, 2. Review with team, 3. Implement and test, 4. Update stakeholders.`,
        priority: `Priority recommendation: "${task.priority}" is appropriate. ${task.priority === "high" ? "Keep this task top of mind — it may block others." : "Consider raising priority if deadlines shift."}`,
    };

    sendJSON(res, 200, { result: actions[action] || "No suggestion available." });
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname || "/";
    const method = req.method || "GET";

    // Handle CORS preflight
    if (method === "OPTIONS") {
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        });
        res.end();
        return;
    }

    try {
        const body = await parseBody(req);

        // Auth routes — no token required
        if (pathname === "/auth/login" && method === "POST") {
            handleLogin(req, res, body);
            return;
        }
        if (pathname === "/auth/register" && method === "POST") {
            handleRegister(req, res, body);
            return;
        }

        // All other routes require auth
        if (pathname === "/auth/me" && method === "GET") {
            if (!authenticate(req, res)) return;
            handleMe(req, res);
            return;
        }
        if (pathname === "/tasks" && method === "GET") {
            if (!authenticate(req, res)) return;
            handleTasksList(req, res);
            return;
        }
        if (pathname === "/tasks" && method === "POST") {
            if (!authenticate(req, res)) return;
            if (!body) {
                sendJSON(res, 400, { error: "Missing task body" });
                return;
            }
            body.id = `task-${Date.now()}`;
            tasks.push(body);
            sendJSON(res, 201, body);
            return;
        }

        const taskStatusMatch = pathname.match(/^\/tasks\/([^\/]+)\/status$/);
        if (taskStatusMatch && method === "PATCH") {
            if (!authenticate(req, res)) return;
            handleUpdateTaskStatus(req, res, taskStatusMatch[1], body);
            return;
        }

        const taskAiMatch = pathname.match(/^\/tasks\/([^\/]+)\/ai\/([^\/]+)$/);
        if (taskAiMatch && method === "POST") {
            if (!authenticate(req, res)) return;
            handleTaskAiAction(req, res, taskAiMatch[1], taskAiMatch[2]);
            return;
        }

        const taskDetailMatch = pathname.match(/^\/tasks\/([^\/]+)$/);
        if (taskDetailMatch) {
            const taskId = taskDetailMatch[1];
            if (method === "GET") {
                if (!authenticate(req, res)) return;
                handleTaskDetail(req, res, taskId);
                return;
            }
            if (method === "PUT") {
                if (!authenticate(req, res)) return;
                handleSaveTask(req, res, taskId, body);
                return;
            }
            if (method === "DELETE") {
                if (!authenticate(req, res)) return;
                handleDeleteTask(req, res, taskId);
                return;
            }
        }

        if (pathname === "/analytics/summary" && method === "GET") {
            if (!authenticate(req, res)) return;
            handleAnalytics(req, res);
            return;
        }

        sendJSON(res, 404, { error: `Not found: ${method} ${pathname}` });
    } catch (error) {
        console.error("Server error:", error);
        sendJSON(res, 500, { error: error.message });
    }
});

server.listen(port, () => {
    console.log(`\n✅ Mock server running at http://localhost:${port}`);
    console.log("\nEndpoints:");
    console.log("  POST /auth/login       — email: sanket@workstation.app  password: password1");
    console.log("  POST /auth/register    — { name, email, password }");
    console.log("  GET  /auth/me          — requires Bearer mock-token");
    console.log("  GET  /tasks            — requires Bearer mock-token");
    console.log("  POST /tasks            — requires Bearer mock-token");
    console.log("  GET  /tasks/:id        — requires Bearer mock-token");
    console.log("  PUT  /tasks/:id        — requires Bearer mock-token");
    console.log("  DELETE /tasks/:id      — requires Bearer mock-token");
    console.log("  PATCH /tasks/:id/status — requires Bearer mock-token");
    console.log("  POST /tasks/:id/ai/:action — requires Bearer mock-token");
    console.log("  GET  /analytics/summary — requires Bearer mock-token");
    console.log("\nUse: Authorization: Bearer mock-token\n");
});
