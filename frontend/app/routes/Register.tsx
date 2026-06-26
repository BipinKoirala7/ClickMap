import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import { FcGoogle } from "react-icons/fc";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg">
          <div className="px-8 pt-8 pb-2 flex justify-center">
            <Logo />
          </div>
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-3xl">
              Create your account
            </CardTitle>
            <CardDescription className="text-base">
              Start mapping clicks in under 60 seconds
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 py-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 text-base"
              disabled={googleLoading}
              onClick={() => {
                setGoogleLoading(true);
                setTimeout(() => {
                  toast.success("Signed up with Google");
                  setGoogleLoading(false);
                }, 600);
              }}
            >
              <FcGoogle className="mr-2 h-5 w-5" />
              {googleLoading ? "Connecting…" : "Continue with Google"}
            </Button>

            <div className="my-6 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs uppercase text-muted-foreground">
                or continue with email
              </span>
              <Separator className="flex-1" />
            </div>

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                setLoading(true);
                setTimeout(() => {
                  toast.success("Account created");
                  navigate("/dashboard");
                }, 600);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="Alex Stone"
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  className="h-11"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 text-base"
                disabled={loading}
              >
                {loading ? "Creating account…" : "Create account"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                By signing up you agree to the Terms of Service.
              </p>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="font-medium text-primary hover:underline"
              >
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
