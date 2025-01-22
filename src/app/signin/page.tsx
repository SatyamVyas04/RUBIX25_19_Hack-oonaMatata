import React from "react";
import {
  INVALID_CREDENTIALS_ERROR_TYPE,
  InvalidCredentials,
  signIn,
} from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthButton } from "@/components/auth/auth-button";

export const runtime = "edge";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  // This might not be needed if Auth.js is properly reading cookies.
  const csrfToken = cookies().get("authjs.csrf-token")?.value ?? "";

  const error = searchParams.error;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#111111] px-6 text-[#b4b4b4]">
      <div className="w-full max-w-md">
        <h1 className="mb-3 text-2xl font-medium text-[#eeeeee]">Sign in</h1>
        <form
          className="flex flex-col gap-3"
          action={async (formData) => {
            "use server";

            try {
              await signIn("credentials", {
                email: formData.get("email"),
                password: formData.get("password"),

                redirectTo: "/",
              });
            } catch (error) {
              if (error instanceof InvalidCredentials) {
                return redirect(`/signin?error=${error.type}`);
              }

              // Otherwise if a redirects happens NextJS can handle it
              // so you can just re-thrown the error and let NextJS handle it.
              // Docs:
              // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
              throw error;
            }
          }}
        >
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <div className="space-y-1">
            <label className="text-sm" htmlFor="email">
              Email
            </label>
            <input
              className="flex h-10 w-full rounded-lg border border-[#3A3A3A] bg-[#222222] px-3 py-2 text-sm ring-offset-[#111111] transition-colors placeholder:text-[#b4b4b4]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e599] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm" htmlFor="password">
              Password
            </label>

            <input
              className="flex h-10 w-full rounded-lg border border-[#3A3A3A] bg-[#222222] px-3 py-2 text-sm ring-offset-[#111111] transition-colors placeholder:text-[#b4b4b4]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00e599] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="password"
              name="password"
              type="password"
              placeholder="•••••••••••"
              required
            />
          </div>
          {error === INVALID_CREDENTIALS_ERROR_TYPE ? (
            <p className="text-sm text-red-500">Wrong credentials!</p>
          ) : null}
          <AuthButton>Sign in</AuthButton>
        </form>

        <div className="mt-4 text-sm text-[#b4b4b4]">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-[#00e599] hover:underline">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
