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

const profile = {
  name: "Alex Stone",
  email: "alex@clickmap.io",
  role: "Founder",
  timezone: "UTC-05:00 Eastern",
};

const initials = profile.name
  .split(" ")
  .map((part) => part[0])
  .join("");

export function ProfileCard() {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Card className="overflow-hidden bg-muted/40">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex size-20 items-center justify-center rounded-full bg-primary text-xl font-medium text-primary-foreground">
              {initials}
            </div>
            <Button type="button" variant="outline">
              Upload
            </Button>
            <Button type="button" variant="ghost">
              Remove
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Full name" defaultValue={profile.name} />
            <Field
              id="email"
              label="Email"
              type="email"
              defaultValue={profile.email}
            />
            <Field id="role" label="Role" defaultValue={profile.role} />
            <Field
              id="timezone"
              label="Timezone"
              defaultValue={profile.timezone}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">Save changes</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
