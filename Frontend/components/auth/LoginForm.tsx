"use client";

import { login } from "@/api/auth/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/lib";
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

    try {
      const response = await login(loginDetails);
      console.log("Register response:", response);
      toast.success(response.message);
      router.push("/dashboard");
    } catch (e) {
      console.log("Error", e);

      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error("Something went wrong!");
      }
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col gap-10">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
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

          <Button
            type="submit"
            size="lg"
            className="mt-2 w-full"
            onClick={loginButtonHandler}
          >
            Log in
          </Button>
        </form>

        <p className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href={ROUTES.AUTH.REGISTER}
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
