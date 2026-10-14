"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/dashboard/Settings/Field";

export function PasswordCard() {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Card className="overflow-hidden bg-muted/40">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password regularly to keep your account secure.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Field
              id="current"
              label="Current"
              type="password"
              autoComplete="current-password"
            />
            <Field
              id="new"
              label="New"
              type="password"
              autoComplete="new-password"
            />
            <Field
              id="confirm"
              label="Confirm"
              type="password"
              autoComplete="new-password"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">Update password</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
