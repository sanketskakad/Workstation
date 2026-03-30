import { render, screen } from "@testing-library/react";
import { TaskModal } from "@/components/TaskModal";

const task = {
  id: "task-1",
  title: "Prepare launch plan",
  description: "Create a comprehensive launch plan for the new product.",
  status: "todo" as const,
  priority: "high" as const,
  assignee: "Sanket K",
  dueDate: "2026-04-25",
  project: "Roadmap",
  subtasks: ["Draft brief", "Share with team"],
};

describe("TaskModal", () => {
  it("renders when open with task data", () => {
    const handleClose = jest.fn();
    const handleSave = jest.fn();

    render(
      <TaskModal
        open={true}
        task={task}
        projects={["Roadmap"]}
        assignees={["Sanket K"]}
        onClose={handleClose}
        onSave={handleSave}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText(/Edit task/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Prepare launch plan")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Update task/i }),
    ).toBeInTheDocument();
  });
});
