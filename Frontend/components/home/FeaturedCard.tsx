import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type FeatureCardPropsT = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export default function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardPropsT) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
