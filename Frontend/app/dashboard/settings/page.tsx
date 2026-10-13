import { SettingsHeader } from "@/components/dashboard/Settings/SettingsHeader";
import { ProfileCard } from "@/components/dashboard/Settings/ProfileCard";
import { PasswordCard } from "@/components/dashboard/Settings/PasswordCard";
import { DangerZoneCard } from "@/components/dashboard/Settings/DangerZoneCard";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <SettingsHeader />
      <ProfileCard />
      <PasswordCard />
      <DangerZoneCard />
    </div>
  );
}
