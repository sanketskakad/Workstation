"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import {
  createSystemUser,
  getUsers,
  updateUser,
  deleteUser,
  resetUserPassword,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ToastProvider";
import {
  UserPlus,
  Shield,
  User as UserIcon,
  UserCog,
  Trash2,
  Edit2,
  RotateCcw,
} from "lucide-react";
import { User } from "@/types";

export default function AdminUsersPage() {
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "Developer",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const { pushToast } = useToast();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("workstation-token")
      : null;

  const loadUsers = async () => {
    if (!token) return;
    setUsersLoading(true);
    try {
      const data = await getUsers(token);
      setUsers(data);
    } catch (err) {
      pushToast({
        title: "Error",
        description: "Failed to load users",
        type: "error",
      });
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!token) return;

    try {
      await createSystemUser(newUser, token);
      pushToast({
        title: "Success",
        description: `User ${newUser.name} created successfully.`,
        type: "success",
      });
      setNewUser({ name: "", email: "", password: "", role: "Developer" });
      await loadUsers();
    } catch (err) {
      pushToast({
        title: "Error",
        description: "Failed to create user. Check if email exists.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !token) return;

    setLoading(true);
    try {
      await updateUser(
        editingUser._id || editingUser.id || "",
        {
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          bio: editingUser.bio,
        },
        token,
      );
      pushToast({
        title: "Success",
        description: "User updated successfully.",
        type: "success",
      });
      setShowEditModal(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      pushToast({
        title: "Error",
        description: "Failed to update user.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!token || !window.confirm("Are you sure you want to delete this user?"))
      return;

    setLoading(true);
    try {
      await deleteUser(id, token);
      pushToast({
        title: "Success",
        description: "User deleted successfully.",
        type: "success",
      });
      await loadUsers();
    } catch (err) {
      pushToast({
        title: "Error",
        description: "Failed to delete user.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUserId || !token) return;

    setLoading(true);
    try {
      await resetUserPassword(resetUserId, resetPassword, token);
      pushToast({
        title: "Success",
        description: "Password reset successfully.",
        type: "success",
      });
      setShowResetModal(false);
      setResetPassword("");
      setResetUserId(null);
    } catch (err) {
      pushToast({
        title: "Error",
        description: "Failed to reset password.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
      case "Project Manager":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300";
      default:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="lg:grid lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <section className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 rounded-4xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 p-8 shadow-soft">
              <div>
                <p className="text-sm uppercase tracking-[0.26em] text-brand-500 dark:text-brand-300">
                  Admin Control
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                  User Management
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Create new users, manage roles, and control system access.
                </p>
              </div>
            </div>

            {/* Create User Form */}
            <div className="mx-auto max-w-2xl mb-10">
              <div className="rounded-4xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-lg">
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold">Create New User</h2>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={newUser.name}
                        onChange={(e) =>
                          setNewUser({ ...newUser, name: e.target.value })
                        }
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">System Role</Label>
                      <select
                        id="role"
                        className="flex h-12 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white"
                        value={newUser.role}
                        onChange={(e) =>
                          setNewUser({ ...newUser, role: e.target.value })
                        }
                      >
                        <option value="Developer">Developer</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      placeholder="john@company.app"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Initial Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      placeholder="********"
                      required
                    />
                    <p className="text-[10px] text-slate-500 italic">
                      User should change this after first login.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-14 text-lg mt-4"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create User"}
                  </Button>
                </form>
              </div>
            </div>

            {/* Role Legend */}
            <div className="mx-auto max-w-6xl mb-10">
              <div className="grid grid-cols-3 gap-6">
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 text-center">
                  <Shield className="h-6 w-6 mx-auto mb-3 text-red-500" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Admin
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Full system access
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 text-center">
                  <UserCog className="h-6 w-6 mx-auto mb-3 text-amber-500" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    PM
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Manage projects
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 text-center">
                  <UserIcon className="h-6 w-6 mx-auto mb-3 text-blue-500" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Developer
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Execute tasks
                  </p>
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="mx-auto max-w-6xl">
              <div className="rounded-4xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-lg">
                <div className="mb-6 flex items-center gap-3">
                  <UserIcon className="h-6 w-6" />
                  <h2 className="text-xl font-bold">
                    Manage Employees ({users.length})
                  </h2>
                </div>

                {usersLoading ? (
                  <div className="py-12 text-center text-slate-500">
                    Loading users...
                  </div>
                ) : users.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    No users found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800">
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Role
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr
                            key={user._id}
                            className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <td className="px-4 py-3 text-sm">{user.name}</td>
                            <td className="px-4 py-3 text-sm text-slate-500">
                              {user.email}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role || "Developer")}`}
                              >
                                {user.role || "Developer"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingUser(user);
                                    setShowEditModal(true);
                                  }}
                                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                  title="Edit user"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setResetUserId(user._id || user.id || null);
                                    setShowResetModal(true);
                                  }}
                                  className="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition"
                                  title="Reset password"
                                >
                                  <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteUser(user._id || user.id || "")
                                  }
                                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                                  title="Delete user"
                                  disabled={loading}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-4xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-6">Edit User</h3>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <select
                  id="edit-role"
                  className="flex h-10 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white"
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                >
                  <option value="Developer">Developer</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-4xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-6">Reset Password</h3>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
                <p className="text-[10px] text-slate-500">
                  User will need to change this on next login.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetPassword("");
                    setResetUserId(null);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
