import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const fields = [
  { id: "name", label: "Full name", type: "text", placeholder: "Alex Stone" },
  {
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
  },
  { id: "password", label: "Password", type: "password", placeholder: "" },
];

export default function RegisterForm() {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Start mapping clicks in under 60 seconds
          </p>
        </div>

        <form className="flex flex-col gap-4">
          {fields.map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <label htmlFor={field.id} className="text-sm font-medium">
                {field.label}
              </label>
              <input
                id={field.id}
                name={field.id}
                type={field.type}
                placeholder={field.placeholder}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              />
            </div>
          ))}

          <Button type="submit" size="lg" className="mt-2 w-full">
            Create account
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          By signing up you agree to the Terms of Service.
        </p>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
