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
import { topReferrers } from "@/lib/analytics-data";

const totalClicks = topReferrers.reduce((sum, r) => sum + r.clicks, 0);

export function ReferrersTable() {
  return (
    <Card className="overflow-hidden bg-muted/40">
      <CardHeader>
        <CardTitle>Top referrers</CardTitle>
        <CardDescription>Where your clicks are coming from</CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="w-1/3">Share</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {topReferrers.map((referrer) => {
              const share = Math.round((referrer.clicks / totalClicks) * 100);

              return (
                <TableRow key={referrer.source}>
                  <TableCell className="font-mono">{referrer.source}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {referrer.clicks.toLocaleString("en-US")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-sm text-muted-foreground tabular-nums">
                        {share}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
