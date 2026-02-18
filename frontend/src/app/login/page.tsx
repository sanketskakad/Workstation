"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ToastProvider";
import { loginSchema } from "@/lib/validation";
import { loginUser } from "@/lib/api";

export default function LoginPage() {
  const { pushToast } = useToast();
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // We explicitly DO NOT use a redirect useEffect here to avoid server/client auth loops.
  // The dashboard page handles redirection if the token is missing/invalid.

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      loginSchema.parse(formState);

      const token = await loginUser(formState);
      localStorage.setItem("workstation-token", token);
      document.cookie = `workstation-token=${token}; path=/;`;
      pushToast({
        title: "Welcome back!",
        description: "Redirecting to your dashboard.",
        type: "success",
      });
      
      // Use window.location.assign for a full page reload to ensure cookies 
      // are properly picked up by Next.js Server Components.
      setTimeout(() => {
        window.location.assign("/dashboard");
      }, 500);
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
          title: "Login failed",
          description: "Check your credentials and try again.",
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
            Sign in
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
            Access your Workstation workspace
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Login using your organization email or continue with Google OAuth.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            globalThis.location.assign(
              process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL ?? "/",
            )
          }
          className="inline-flex items-center justify-center rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-5 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 transition hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          Sign in with Google
        </button>

        <div className="grid gap-4">
          <form className="grid gap-6" onSubmit={handleSubmit}>
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

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            New to Workstation?{" "}
            <Link
              href="/register"
              className="font-semibold text-brand-500 dark:text-white hover:text-brand-400"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
