import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/lib";
import Link from "next/link";

export default function LoginForm() {
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
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button type="submit" size="lg" className="mt-2 w-full">
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
