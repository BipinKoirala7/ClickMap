import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RankedItem = { label: string; value: number };

type RankedListProps = {
  title: string;
  description: string;
  items: RankedItem[];
};

export function RankedList({ title, description, items }: RankedListProps) {
  const max = Math.max(...items.map((item) => item.value));

  return (
    <Card className="overflow-hidden bg-muted/40">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span>{item.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {item.value.toLocaleString("en-US")}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
