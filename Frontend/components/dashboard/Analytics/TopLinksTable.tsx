import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendSparkLine } from "@/components/dashboard/Analytics/TrendSparkLine";
import { topLinks } from "@/lib/analytics-data";
import { cn } from "@/lib/utils";

export function TopLinksTable() {
  return (
    <Card className="overflow-hidden bg-muted/40">
      <CardHeader>
        <CardTitle>Top performing links</CardTitle>
        <CardDescription>
          Ranked by total clicks in the selected period
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Short link</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">Unique</TableHead>
              <TableHead className="text-right">CTR trend</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {topLinks.map((link, index) => (
              <TableRow key={link.slug}>
                <TableCell className="font-mono text-primary">
                  {link.slug}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      link.status === "active" && "bg-primary/15 text-primary",
                    )}
                  >
                    {link.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {link.clicks.toLocaleString("en-US")}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {link.unique.toLocaleString("en-US")}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <TrendSparkLine seed={index} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
