import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DangerZoneCard() {
  return (
    <Card className="border border-destructive/40 bg-destructive/10">
      <CardHeader>
        <CardTitle className="text-destructive">Danger zone</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated links.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          This action cannot be undone.
        </p>
        <Button
          variant="destructive"
          className="bg-destructive text-white hover:bg-destructive/90"
        >
          <Trash2 className="size-4" />
          Delete account
        </Button>
      </CardContent>
    </Card>
  );
}
