"use client";

import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Notification = {
  id: string;
  title: string;
  description?: string;
  time: string;
};

// Empty for now; swap in real data later
const notifications: Notification[] = [];

function Notification() {
  const hasUnread = notifications.length > 0;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            className="relative rounded-lg p-2 bg-transparent text-foreground hover:bg-accent"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-muted-foreground" />
            {hasUnread && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
        }
      ></PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 rounded-2xl p-0"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-orange-500/10">
              <BellOff className="size-5 text-orange-500" />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-xs text-muted-foreground">
                You&apos;re all caught up.
              </p>
            </div>
          </div>
        ) : (
          <ul className="max-h-80 divide-y overflow-y-auto">
            {notifications.map((n) => (
              <li key={n.id} className="px-4 py-3">
                <p className="text-sm font-medium">{n.title}</p>
                {n.description && (
                  <p className="text-xs text-muted-foreground">
                    {n.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default Notification;
