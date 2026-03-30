import { render, screen, waitFor, act } from "@testing-library/react";
import {
  useNotifications,
  NotificationProvider,
  type Notification,
} from "@/context/NotificationContext";
import { ReactNode } from "react";
import * as api from "@/lib/api";

jest.mock("@/lib/api");

const TestComponent = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismiss } =
    useNotifications();

  return (
    <div>
      <div data-testid="unread-count">{unreadCount}</div>
      <div data-testid="notifications-count">{notifications.length}</div>
      {notifications.map((n) => (
        <div key={n._id} data-testid={`notification-${n._id}`}>
          <span>{n.title}</span>
          <button onClick={() => markAsRead(n._id)}>Mark as read</button>
          <button onClick={() => dismiss(n._id)}>Dismiss</button>
        </div>
      ))}
      <button onClick={markAllAsRead}>Mark all as read</button>
    </div>
  );
};

const renderWithProvider = (component: ReactNode) => {
  return render(<NotificationProvider>{component}</NotificationProvider>);
};

describe("NotificationContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("NotificationProvider", () => {
    it("provides notifications context to children", () => {
      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId("unread-count")).toBeInTheDocument();
      expect(screen.getByTestId("notifications-count")).toBeInTheDocument();
    });

    it("fetches notifications on mount", async () => {
      const mockNotifications: Notification[] = [
        {
          _id: "1",
          title: "Test Notification",
          description: "Test description",
          type: "info",
          createdAt: new Date().toISOString(),
          unread: true,
        },
      ];

      localStorage.setItem("workstation-token", "test-token");
      (api.getNotifications as jest.Mock).mockResolvedValue(mockNotifications);

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(api.getNotifications).toHaveBeenCalledWith("test-token");
      });
    });

    it("handles missing token gracefully", () => {
      (api.getNotifications as jest.Mock).mockResolvedValue([]);

      renderWithProvider(<TestComponent />);

      expect(screen.getByTestId("notifications-count")).toHaveTextContent("0");
    });

    it("displays initial notifications count", async () => {
      const mockNotifications: Notification[] = [
        {
          _id: "1",
          title: "Notification 1",
          description: "Description 1",
          type: "info",
          createdAt: new Date().toISOString(),
          unread: true,
        },
        {
          _id: "2",
          title: "Notification 2",
          description: "Description 2",
          type: "success",
          createdAt: new Date().toISOString(),
          unread: false,
        },
      ];

      localStorage.setItem("workstation-token", "test-token");
      (api.getNotifications as jest.Mock).mockResolvedValue(mockNotifications);

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("notifications-count")).toHaveTextContent(
          "2",
        );
      });
    });

    it("calculates unread count correctly", async () => {
      const mockNotifications: Notification[] = [
        {
          _id: "1",
          title: "Unread 1",
          description: "Description",
          type: "info",
          createdAt: new Date().toISOString(),
          unread: true,
        },
        {
          _id: "2",
          title: "Read 1",
          description: "Description",
          type: "info",
          createdAt: new Date().toISOString(),
          unread: false,
        },
        {
          _id: "3",
          title: "Unread 2",
          description: "Description",
          type: "warning",
          createdAt: new Date().toISOString(),
          unread: true,
        },
      ];

      localStorage.setItem("workstation-token", "test-token");
      (api.getNotifications as jest.Mock).mockResolvedValue(mockNotifications);

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("unread-count")).toHaveTextContent("2");
      });
    });

    it("handles API error when fetching notifications", async () => {
      localStorage.setItem("workstation-token", "test-token");
      const consoleError = jest.spyOn(console, "error").mockImplementation();
      (api.getNotifications as jest.Mock).mockRejectedValue(
        new Error("API error"),
      );

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          expect.stringContaining("Failed to fetch notifications"),
          expect.any(Error),
        );
      });

      consoleError.mockRestore();
    });
  });

  describe("markAsRead", () => {
    it("marks notification as read", async () => {
      const mockNotifications: Notification[] = [
        {
          _id: "1",
          title: "Test",
          description: "Description",
          type: "info",
          createdAt: new Date().toISOString(),
          unread: true,
        },
      ];

      localStorage.setItem("workstation-token", "test-token");
      (api.getNotifications as jest.Mock).mockResolvedValue(mockNotifications);
      (api.markNotificationRead as jest.Mock).mockResolvedValue({});

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("notification-1")).toBeInTheDocument();
      });

      const markButton = screen.getByText("Mark as read");
      act(() => {
        markButton.click();
      });

      await waitFor(() => {
        expect(api.markNotificationRead).toHaveBeenCalledWith(
          "1",
          "test-token",
        );
      });
    });

    it("updates unread count after marking as read", async () => {
      const mockNotifications: Notification[] = [
        {
          _id: "1",
          title: "Test",
          description: "Description",
          type: "info",
          createdAt: new Date().toISOString(),
          unread: true,
        },
      ];

      localStorage.setItem("workstation-token", "test-token");
      (api.getNotifications as jest.Mock).mockResolvedValue(mockNotifications);
      (api.markNotificationRead as jest.Mock).mockResolvedValue({});

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("unread-count")).toHaveTextContent("1");
      });

      const markButton = screen.getByText("Mark as read");
      act(() => {
        markButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("unread-count")).toHaveTextContent("0");
      });
    });

    it("handles API error when marking as read", async () => {
      const mockNotifications: Notification[] = [
        {
          _id: "1",
          title: "Test",
          description: "Description",
          type: "info",
          createdAt: new Date().toISOString(),
          unread: true,
        },
      ];

      localStorage.setItem("workstation-token", "test-token");
      (api.getNotifications as jest.Mock).mockResolvedValue(mockNotifications);
      const consoleError = jest.spyOn(console, "error").mockImplementation();
      (api.markNotificationRead as jest.Mock).mockRejectedValue(
        new Error("API error"),
      );

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("notification-1")).toBeInTheDocument();
      });

      const markButton = screen.getByText("Mark as read");
      act(() => {
        markButton.click();
      });

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  describe("markAllAsRead", () => {
    it("marks all notifications as read", async () => {
      const mockNotifications: Notification[] = [
        {
          _id: "1",
          title: "Notification 1",
          description: "Description",
          type: "info",
          createdAt: new Date().toISOString(),
          unread: true,
        },
        {
          _id: "2",
          title: "Notification 2",
          description: "Description",
          type: "success",
          createdAt: new Date().toISOString(),
          unread: true,
        },
      ];

      localStorage.setItem("workstation-token", "test-token");
      (api.getNotifications as jest.Mock).mockResolvedValue(mockNotifications);
      (api.markNotificationRead as jest.Mock).mockResolvedValue({});

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("unread-count")).toHaveTextContent("2");
      });

      const markAllButton = screen.getByText("Mark all as read");
      act(() => {
        markAllButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("unread-count")).toHaveTextContent("0");
      });
    });

    it("calls API to mark all notifications as read", async () => {
      const mockNotifications: Notification[] = [
        {
          _id: "1",
          title: "Notification 1",
          description: "Description",
          type: "info",
          createdAt: new Date().toISOString(),
          unread: true,
        },
        {
          _id: "2",
          title: "Notification 2",
          description: "Description",
          type: "success",
          createdAt: new Date().toISOString(),
          unread: true,
        },
      ];

      localStorage.setItem("workstation-token", "test-token");
      (api.getNotifications as jest.Mock).mockResolvedValue(mockNotifications);
      (api.markNotificationRead as jest.Mock).mockResolvedValue({});

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("notification-1")).toBeInTheDocument();
      });

      const markAllButton = screen.getByText("Mark all as read");
      act(() => {
        markAllButton.click();
      });

      await waitFor(() => {
        expect(api.markNotificationRead).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("dismiss", () => {
    it("removes notification from list", async () => {
      const mockNotifications: Notification[] = [
        {
          _id: "1",
          title: "Test Notification",
          description: "Description",
          type: "info",
          createdAt: new Date().toISOString(),
          unread: false,
        },
      ];

      localStorage.setItem("workstation-token", "test-token");
      (api.getNotifications as jest.Mock).mockResolvedValue(mockNotifications);
      (api.deleteNotification as jest.Mock).mockResolvedValue({});

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("notification-1")).toBeInTheDocument();
      });

      expect(screen.getByTestId("notifications-count")).toHaveTextContent("1");

      const dismissButton = screen.getByText("Dismiss");
      act(() => {
        dismissButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("notifications-count")).toHaveTextContent(
          "0",
        );
      });
    });

    it("calls API to delete notification", async () => {
      const mockNotifications: Notification[] = [
        {
          _id: "1",
          title: "Test Notification",
          description: "Description",
          type: "info",
          createdAt: new Date().toISOString(),
          unread: false,
        },
      ];

      localStorage.setItem("workstation-token", "test-token");
      (api.getNotifications as jest.Mock).mockResolvedValue(mockNotifications);
      (api.deleteNotification as jest.Mock).mockResolvedValue({});

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("notification-1")).toBeInTheDocument();
      });

      const dismissButton = screen.getByText("Dismiss");
      act(() => {
        dismissButton.click();
      });

      await waitFor(() => {
        expect(api.deleteNotification).toHaveBeenCalledWith("1", "test-token");
      });
    });

    it("handles API error when deleting notification", async () => {
      const mockNotifications: Notification[] = [
        {
          _id: "1",
          title: "Test Notification",
          description: "Description",
          type: "info",
          createdAt: new Date().toISOString(),
          unread: false,
        },
      ];

      localStorage.setItem("workstation-token", "test-token");
      (api.getNotifications as jest.Mock).mockResolvedValue(mockNotifications);
      const consoleError = jest.spyOn(console, "error").mockImplementation();
      (api.deleteNotification as jest.Mock).mockRejectedValue(
        new Error("API error"),
      );

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("notification-1")).toBeInTheDocument();
      });

      const dismissButton = screen.getByText("Dismiss");
      act(() => {
        dismissButton.click();
      });

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  describe("useNotifications", () => {
    it("throws error when used outside provider", () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation();

      const TestComponentOutsideProvider = () => {
        try {
          useNotifications();
          return <div>Should not render</div>;
        } catch (e) {
          return <div>Error caught</div>;
        }
      };

      expect(() => {
        render(<TestComponentOutsideProvider />);
      }).toThrow("useNotifications must be used within NotificationProvider");

      consoleError.mockRestore();
    });
  });

  describe("notifications updates", () => {
    it("re-fetches notifications when token changes", async () => {
      const mockNotifications: Notification[] = [
        {
          _id: "1",
          title: "Notification",
          description: "Description",
          type: "info",
          createdAt: new Date().toISOString(),
          unread: false,
        },
      ];

      (api.getNotifications as jest.Mock).mockResolvedValue(mockNotifications);

      const { rerender } = renderWithProvider(<TestComponent />);

      localStorage.setItem("workstation-token", "test-token");

      // Trigger re-render to simulate token update
      rerender(
        <NotificationProvider>
          <TestComponent />
        </NotificationProvider>,
      );

      await waitFor(() => {
        expect(api.getNotifications).toHaveBeenCalled();
      });
    });

    it("handles notifications with different types", async () => {
      const mockNotifications: Notification[] = [
        {
          _id: "1",
          title: "Info notification",
          description: "Info description",
          type: "info",
          createdAt: new Date().toISOString(),
          unread: true,
        },
        {
          _id: "2",
          title: "Success notification",
          description: "Success description",
          type: "success",
          createdAt: new Date().toISOString(),
          unread: true,
        },
        {
          _id: "3",
          title: "Warning notification",
          description: "Warning description",
          type: "warning",
          createdAt: new Date().toISOString(),
          unread: false,
        },
        {
          _id: "4",
          title: "Message notification",
          description: "Message description",
          type: "message",
          createdAt: new Date().toISOString(),
          unread: false,
        },
      ];

      localStorage.setItem("workstation-token", "test-token");
      (api.getNotifications as jest.Mock).mockResolvedValue(mockNotifications);

      renderWithProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("notifications-count")).toHaveTextContent(
          "4",
        );
        expect(screen.getByTestId("unread-count")).toHaveTextContent("2");
      });
    });
  });
});
