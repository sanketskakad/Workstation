import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskCard } from "@/components/TaskCard";

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

describe("TaskCard", () => {
  it("renders task fields and triggers click handler", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<TaskCard task={task} onClick={onClick} />);

    expect(screen.getByText(/Prepare launch plan/i)).toBeInTheDocument();
    expect(screen.getByText(/HIGH/i)).toBeInTheDocument();
    expect(screen.getByText(/Sanket K/i)).toBeInTheDocument();
    expect(screen.getByText(/2026-04-25/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
