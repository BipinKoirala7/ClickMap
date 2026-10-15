"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateLinkDto } from "@/types";

type FieldErrors = Partial<
  Record<"originalUrl" | "alias" | "expiresAt", string>
>;

const ALIAS_REGEX = /^[a-zA-Z0-9_-]{3,32}$/;

function todayISODate() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function validate(
  originalUrl: string,
  alias: string,
  expires: string,
): FieldErrors {
  const errors: FieldErrors = {};

  try {
    const u = new URL(originalUrl.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      errors.originalUrl = "URL must start with http:// or https://";
    }
  } catch {
    errors.originalUrl =
      "Enter a valid URL, e.g. https://example.com/your-long-url";
  }

  if (alias && !ALIAS_REGEX.test(alias)) {
    errors.alias = "3–32 characters: letters, numbers, - and _ only";
  }

  if (expires && expires < todayISODate()) {
    errors.expiresAt = "Expiry date can't be in the past";
  }

  return errors;
}

type CreateLinkDialogProps = {
  onCreate: (values: CreateLinkDto) => Promise<void>;
  trigger: React.ReactNode;
};

export function CreateLinkDialog({ onCreate, trigger }: CreateLinkDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [originalUrl, setOriginalUrl] = React.useState("");
  const [alias, setAlias] = React.useState("");
  const [expires, setExpires] = React.useState("");
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  function reset() {
    setOriginalUrl("");
    setAlias("");
    setExpires("");
    setErrors({});
    setFormError(null);
    setSubmitting(false);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const fieldErrors = validate(originalUrl, alias.trim(), expires);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        originalUrl: originalUrl.trim(),
        shortCode: alias.trim(),
        expiresAt: new Date(`${expires}T23:59:59`).toISOString(),
      });
      handleOpenChange(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Create a new link</DialogTitle>
            <DialogDescription>
              Shorten any URL and add optional metadata.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="original-url">Original URL</Label>
            <Input
              id="original-url"
              type="url"
              autoFocus
              placeholder="https://example.com/your-long-url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              aria-invalid={!!errors.originalUrl}
              aria-describedby={
                errors.originalUrl ? "original-url-error" : undefined
              }
              disabled={submitting}
            />
            {errors.originalUrl && (
              <p id="original-url-error" className="text-sm text-destructive">
                {errors.originalUrl}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid content-start gap-2">
              <Label htmlFor="alias">Title</Label>
              <Input
                id="alias"
                placeholder="My Short Link"
                className="font-mono"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-invalid={!!errors.alias}
                aria-describedby={errors.alias ? "alias-error" : undefined}
                disabled={submitting}
                autoComplete="off"
                spellCheck={false}
              />
              {errors.alias && (
                <p id="alias-error" className="text-sm text-destructive">
                  {errors.alias}
                </p>
              )}
            </div>
            <div className="grid content-start gap-2">
              <Label htmlFor="alias">Custom alias</Label>
              <Input
                id="alias"
                placeholder="launch"
                className="font-mono"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                aria-invalid={!!errors.alias}
                aria-describedby={errors.alias ? "alias-error" : undefined}
                disabled={submitting}
                autoComplete="off"
                spellCheck={false}
              />
              {errors.alias && (
                <p id="alias-error" className="text-sm text-destructive">
                  {errors.alias}
                </p>
              )}
            </div>

            <div className="grid content-start gap-2">
              <Label htmlFor="expires">Expires</Label>
              <Input
                id="expires"
                type="date"
                min={todayISODate()}
                value={expires}
                onChange={(e) => setExpires(e.target.value)}
                aria-invalid={!!errors.expiresAt}
                aria-describedby={
                  errors.expiresAt ? "expires-error" : undefined
                }
                disabled={submitting}
              />
              {errors.expiresAt && (
                <p id="expires-error" className="text-sm text-destructive">
                  {errors.expiresAt}
                </p>
              )}
            </div>
          </div>

          {formError && (
            <p role="alert" className="text-sm text-destructive">
              {formError}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
