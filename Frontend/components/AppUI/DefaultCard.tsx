import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X } from "lucide-react";
import { ReactElement, ReactNode } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

type DefaultCardPropsT = {
  title?: string;
  description?: string;
  header?: ReactNode;
  action?: () => void;
  children?: ReactNode;
  footer?: ReactElement;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
};

function DefaultCard({
  title,
  description,
  header,
  action,
  children,
  footer,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
}: DefaultCardPropsT) {
  return (
    <Card className={className}>
      {(header || title || description || action != undefined) && (
        <CardHeader className={headerClassName}>
          {header ? (
            header
          ) : (
            <>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </>
          )}
          {action != undefined && (
            <CardAction>
              <Button variant="ghost" size="icon" onClick={action}>
                <X />
              </Button>
            </CardAction>
          )}
        </CardHeader>
      )}
      <CardContent className={cn(contentClassName)}>{children}</CardContent>
      {footer && (
        <CardFooter className={cn("flex-col gap-2", footerClassName)}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

export default DefaultCard;
