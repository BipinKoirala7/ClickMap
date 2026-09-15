import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PricingCardPropsT = {
  name: string;
  description: string;
  price: string;
  period?: string;
  cta: string;
  features: string[];
  highlighted?: boolean;
};

export default function PricingCard({
  name,
  description,
  price,
  period,
  cta,
  features,
  highlighted = false,
}: PricingCardPropsT) {
  return (
    <div className="relative">
      {highlighted && (
        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-100">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            <Sparkles className="size-3" />
            Most popular
          </span>
        </div>
      )}

      <Card
        className={cn(
          "flex flex-col gap-6",
          highlighted && "border-primary shadow-lg",
        )}
      >
        <CardContent className="flex flex-1 flex-col gap-6">
          <div>
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight">{price}</span>
            {period && (
              <span className="text-sm text-muted-foreground">{period}</span>
            )}
          </div>

          <Button
            size="lg"
            variant={highlighted ? "default" : "outline"}
            className="w-full"
          >
            {cta}
          </Button>

          <ul className="flex flex-col gap-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-3" />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
