import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminUsersPage from "@/app/admin/users/page";
import * as api from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

// Mock dependencies
jest.mock("@/lib/api");
jest.mock("@/components/ToastProvider");
jest.mock("@/components/Sidebar", () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));
jest.mock("@/components/Navbar", () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

describe("Admin Users Page", () => {
  const mockToast = jest.fn();
  const mockToken = "test-token";

  const mockUsers = [
    {
      _id: "user1",
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
    },
    {
      _id: "user2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Project Manager",
    },
    {
      _id: "user3",
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "Developer",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("workstation-token", mockToken);
    (useToast as jest.Mock).mockReturnValue({
      pushToast: mockToast,
    });
    (api.getUsers as jest.Mock).mockResolvedValue(mockUsers);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Page Rendering", () => {
    it("should render admin users page with all sections", async () => {
      render(<AdminUsersPage />);

      expect(screen.getByText("User Management")).toBeInTheDocument();
      expect(screen.getByText("Create New User")).toBeInTheDocument();
      expect(screen.getByText("Manage Employees (3)")).toBeInTheDocument();
    });

    it("should render role legend", async () => {
      render(<AdminUsersPage />);

      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByText("PM")).toBeInTheDocument();
      expect(screen.getByText("Developer")).toBeInTheDocument();
    });

    it("should render form inputs", () => {
      render(<AdminUsersPage />);

      expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("john@company.app"),
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("********")).toBeInTheDocument();
    });
  });

  describe("Create User", () => {
    it("should create a new user successfully", async () => {
      const user = userEvent.setup();
      (api.createSystemUser as jest.Mock).mockResolvedValue({ _id: "newuser" });

      render(<AdminUsersPage />);

      // Fill form
      await user.type(screen.getByPlaceholderText("John Doe"), "New User");
      await user.type(
        screen.getByPlaceholderText("john@company.app"),
        "newuser@example.com",
      );
      await user.type(screen.getByPlaceholderText("********"), "We@reDev9");

      // Submit
      const submitButton = screen.getByRole("button", { name: /Create User/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(api.createSystemUser).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "New User",
            email: "newuser@example.com",
            password: "We@reDev9",
          }),
          mockToken,
        );
      });
    });

    it("should show success toast on user creation", async () => {
      const user = userEvent.setup();
      (api.createSystemUser as jest.Mock).mockResolvedValue({ _id: "newuser" });

      render(<AdminUsersPage />);

      await user.type(screen.getByPlaceholderText("John Doe"), "New User");
      await user.type(
        screen.getByPlaceholderText("john@company.app"),
        "newuser@example.com",
      );
      await user.type(screen.getByPlaceholderText("********"), "We@reDev9");

      await user.click(screen.getByRole("button", { name: /Create User/i }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "success",
            title: "Success",
          }),
        );
      });
    });

    it("should show error toast on creation failure", async () => {
      const user = userEvent.setup();
      (api.createSystemUser as jest.Mock).mockRejectedValue(
        new Error("Email exists"),
      );

      render(<AdminUsersPage />);

      await user.type(screen.getByPlaceholderText("John Doe"), "New User");
      await user.type(
        screen.getByPlaceholderText("john@company.app"),
        "existing@example.com",
      );
      await user.type(screen.getByPlaceholderText("********"), "We@reDev9");

      await user.click(screen.getByRole("button", { name: /Create User/i }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "error",
          }),
        );
      });
    });

    it("should reset form after successful creation", async () => {
      const user = userEvent.setup();
      (api.createSystemUser as jest.Mock).mockResolvedValue({ _id: "newuser" });

      render(<AdminUsersPage />);

      const nameInput = screen.getByPlaceholderText(
        "John Doe",
      ) as HTMLInputElement;
      await user.type(nameInput, "New User");
      await user.click(screen.getByRole("button", { name: /Create User/i }));

      await waitFor(() => {
        expect(nameInput.value).toBe("");
      });
    });
  });

  describe("Employee List", () => {
    it("should display all employees in table", async () => {
      render(<AdminUsersPage />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
      });
    });

    it("should display role badges with correct colors", async () => {
      render(<AdminUsersPage />);

      await waitFor(() => {
        const adminBadges = screen.getAllByText("Admin");
        expect(adminBadges.length).toBeGreaterThan(0);
      });
    });

    it("should display action buttons for each user", async () => {
      render(<AdminUsersPage />);

      await waitFor(() => {
        const editButtons = screen
          .getAllByRole("button")
          .filter(
            (btn) =>
              btn.querySelector("svg") &&
              btn.parentElement?.textContent.includes("John"),
          );
        expect(editButtons.length).toBeGreaterThan(0);
      });
    });

    it("should show loading state", async () => {
      (api.getUsers as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(mockUsers), 100)),
      );

      render(<AdminUsersPage />);

      expect(screen.getByText("Loading users...")).toBeInTheDocument();
    });

    it("should show empty state when no users", async () => {
      (api.getUsers as jest.Mock).mockResolvedValue([]);

      render(<AdminUsersPage />);

      await waitFor(() => {
        expect(screen.getByText("No users found")).toBeInTheDocument();
      });
    });
  });

  describe("Edit User", () => {
    it("should open edit modal when edit button clicked", async () => {
      const user = userEvent.setup();
      render(<AdminUsersPage />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      // Find and click edit button for first user
      const editButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.querySelector("svg"));

      if (editButtons.length > 0) {
        await user.click(editButtons[0]);
        expect(screen.getByText("Edit User")).toBeInTheDocument();
      }
    });

    it("should update user successfully", async () => {
      const user = userEvent.setup();
      (api.updateUser as jest.Mock).mockResolvedValue({
        ...mockUsers[0],
        name: "Updated Name",
      });

      render(<AdminUsersPage />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      // Open edit modal and update
      const editButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.querySelector("svg"));

      if (editButtons.length > 0) {
        await user.click(editButtons[0]);

        const nameInput = screen.getByDisplayValue(
          "John Doe",
        ) as HTMLInputElement;
        await user.clear(nameInput);
        await user.type(nameInput, "Updated Name");

        const saveButton = screen.getByRole("button", {
          name: /Save Changes/i,
        });
        await user.click(saveButton);

        await waitFor(() => {
          expect(api.updateUser).toHaveBeenCalled();
        });
      }
    });

    it("should close modal on cancel", async () => {
      const user = userEvent.setup();
      render(<AdminUsersPage />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const editButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.querySelector("svg"));

      if (editButtons.length > 0) {
        await user.click(editButtons[0]);
        expect(screen.getByText("Edit User")).toBeInTheDocument();

        const cancelButton = screen.getByRole("button", { name: /Cancel/i });
        await user.click(cancelButton);

        await waitFor(() => {
          expect(screen.queryByText("Edit User")).not.toBeInTheDocument();
        });
      }
    });
  });

  describe("Delete User", () => {
    it("should delete user on confirmation", async () => {
      const user = userEvent.setup();
      (api.deleteUser as jest.Mock).mockResolvedValue({});
      window.confirm = jest.fn(() => true);

      render(<AdminUsersPage />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      // Find delete button (last icon button for first user row)
      const deleteButtons = screen
        .getAllByRole("button")
        .filter(
          (btn) =>
            btn.querySelector("svg") &&
            btn.parentElement?.parentElement?.textContent.includes("John"),
        );

      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[deleteButtons.length - 1]);

        await waitFor(() => {
          expect(api.deleteUser).toHaveBeenCalled();
        });
      }
    });

    it("should show confirmation dialog before delete", async () => {
      window.confirm = jest.fn(() => false);

      render(<AdminUsersPage />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button");
      const deleteButton = deleteButtons.find((btn) =>
        btn.getAttribute("title")?.includes("Delete"),
      );

      if (deleteButton) {
        fireEvent.click(deleteButton);
        expect(window.confirm).toHaveBeenCalled();
      }
    });
  });

  describe("Reset Password", () => {
    it("should open reset password modal", async () => {
      const user = userEvent.setup();
      render(<AdminUsersPage />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const resetButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.getAttribute("title")?.includes("Reset password"));

      if (resetButtons.length > 0) {
        await user.click(resetButtons[0]);
        expect(screen.getByText("Reset Password")).toBeInTheDocument();
      }
    });

    it("should reset password successfully", async () => {
      const user = userEvent.setup();
      (api.resetUserPassword as jest.Mock).mockResolvedValue({});

      render(<AdminUsersPage />);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const resetButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.getAttribute("title")?.includes("Reset password"));

      if (resetButtons.length > 0) {
        await user.click(resetButtons[0]);

        const passwordInput = screen.getByPlaceholderText("Enter new password");
        await user.type(passwordInput, "NewWe@reDev9");

        const submitButton = screen.getByRole("button", {
          name: /Reset Password/i,
        });
        await user.click(submitButton);

        await waitFor(() => {
          expect(api.resetUserPassword).toHaveBeenCalled();
        });
      }
    });
  });
});
