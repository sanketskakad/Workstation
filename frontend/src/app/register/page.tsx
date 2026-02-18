"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ToastProvider";
import { registerSchema } from "@/lib/validation";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      registerSchema.parse(formState);

      const token = await registerUser(formState);
      localStorage.setItem("workstation-token", token);
      document.cookie = `workstation-token=${token}; path=/;`;
      pushToast({
        title: "Account created",
        description: "Welcome to Workstation.",
        type: "success",
      });
      router.push("/dashboard");
    } catch (error) {
      const validationError = error as z.ZodError;
      if (validationError?.issues) {
        setErrors(
          Object.fromEntries(
            validationError.issues.map((issue) => [
              issue.path.join("."),
              issue.message,
            ]),
          ),
        );
      } else {
        pushToast({
          title: "Signup failed",
          description: "Please verify your information and try again.",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 px-6 py-10 text-slate-900 dark:text-slate-100 sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-2xl gap-10 rounded-4xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 p-10 shadow-soft">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500 dark:text-brand-300">
            Create your team
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
            Start collaborating in minutes.
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign up and get access to team boards, analytics, and AI-assisted
            task planning.
          </p>
        </div>

        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formState.name}
              onChange={(e) =>
                setFormState({ ...formState, name: e.target.value })
              }
              placeholder="Vyom K"
            />
            {errors.name ? (
              <p className="text-sm text-rose-500">{errors.name}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formState.email}
              onChange={(e) =>
                setFormState({ ...formState, email: e.target.value })
              }
              placeholder="hello@company.com"
            />
            {errors.email ? (
              <p className="text-sm text-rose-500">{errors.email}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formState.password}
                onChange={(e) =>
                  setFormState({ ...formState, password: e.target.value })
                }
                placeholder="********"
              />
              {errors.password ? (
                <p className="text-sm text-rose-500">{errors.password}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formState.confirmPassword}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="********"
              />
              {errors.confirmPassword ? (
                <p className="text-sm text-rose-500">
                  {errors.confirmPassword}
                </p>
              ) : null}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-500 dark:text-white hover:text-brand-400"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
