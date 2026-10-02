"use client";

import { login } from "@/api/auth/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/lib";
import { loginSchema } from "@/lib/validation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MouseEvent, useState } from "react";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();
  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
  });

  const loginButtonHandler = async (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    console.log("Logging user:", loginDetails.email);

    const parsedLoginDetails = loginSchema.safeParse(loginDetails);

    if (!parsedLoginDetails.success) {
      const errorMessage = parsedLoginDetails.error.issues[0].message;
      toast.error(errorMessage);
      return;
    }

    toast.promise(login(parsedLoginDetails.data), {
      loading: "Logging in...",
      success: (data) => {
        router.push("/dashboard");
        return data.message;
      },
      error: (err) =>
        err instanceof Error ? err.message : "Something went wrong!",
    });
  };

  return (
    <Card className="w-full p-5 md:p-10">
      <CardContent className="flex flex-col gap-10">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Log in to your ClickMap account
          </p>
        </div>

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={loginDetails.email}
              onChange={(e) =>
                setLoginDetails((data) => ({ ...data, email: e.target.value }))
              }
              placeholder="you@example.com"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Link
                href={ROUTES.AUTH.FORGOT_PASSWORD}
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              value={loginDetails.password}
              onChange={(e) =>
                setLoginDetails((data) => ({
                  ...data,
                  password: e.target.value,
                }))
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              size="lg"
              className="mt-2 w-full"
              onClick={loginButtonHandler}
            >
              Log in
            </Button>
            <p className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href={ROUTES.AUTH.REGISTER}
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
