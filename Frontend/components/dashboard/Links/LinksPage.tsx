import LinksPageHeader from "@/components/dashboard/Links/LinksPageHeader";
import LinksTable from "@/components/dashboard/Links/LinksTable";

export default function LinksPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <LinksPageHeader />
      <LinksTable />
    </div>
  );
}
