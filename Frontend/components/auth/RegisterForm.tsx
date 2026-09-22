"use client";

import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/lib";
import { MouseEvent, useState } from "react";
import { RegisterUserDto } from "@/types";
import { register } from "@/api/auth/auth";
import { useRouter } from "next/navigation";

interface Field {
  id: keyof RegisterUserDto;
  label: string;
  type: string;
  placeholder: string;
}

const fields: Field[] = [
  { id: "name", label: "Full name", type: "text", placeholder: "Alex Stone" },
  {
    id: "userName",
    label: "User name",
    type: "text",
    placeholder: "@alex_stone",
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "you@example.com",
  },
  { id: "password", label: "Password", type: "password", placeholder: "" },
];

export default function RegisterForm() {
  const router = useRouter();
  const [registerDetails, setRegisterDetails] = useState<RegisterUserDto>({
    name: "",
    userName: "",
    email: "",
    password: "",
  });

  const createAccountButtonHandler = async (
    e: MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    e.preventDefault();
    console.log("Register details:", registerDetails);

    try {
      const response = await register(registerDetails);
      console.log("Register response:", response);
      toast.success("Account created successfully!");
      router.push("/auth/login");
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
                value={registerDetails[field.id]}
                onChange={(e) =>
                  setRegisterDetails((prevDetails: RegisterUserDto) => ({
                    ...prevDetails,
                    [field.id]: e.target.value,
                  }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              />
            </div>
          ))}

          <Button
            onClick={createAccountButtonHandler}
            type="submit"
            size="lg"
            className="mt-2 w-full"
          >
            Create account
          </Button>
        </form>

        <div className="flex flex-col gap-2">
          <p className="text-center text-xs text-muted-foreground">
            By signing up you agree to the Terms of Service.
          </p>

          <p className="text-center text-xs">
            Already have an account?{" "}
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="font-medium text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
