import {
  LuLink2,
  LuMousePointerClick,
  LuTrendingUp,
  LuActivity,
  LuPencil,
  LuTrash2,
} from "react-icons/lu";
import { FiMoreHorizontal, FiCopy } from "react-icons/fi";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { links, clicksOverTime } from "@/lib/mock-data";
import { toast } from "sonner";
import { Link } from "react-router";

const stats = [
  { label: "Total Links", value: "1,284", change: "+12.4%", icon: LuLink2 },
  {
    label: "Total Clicks",
    value: "248,910",
    change: "+8.1%",
    icon: LuMousePointerClick,
  },
  { label: "Active Links", value: "1,128", change: "+3.2%", icon: LuActivity },
  { label: "Click Rate", value: "62.4%", change: "+1.8%", icon: LuTrendingUp },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Overview
        </h1>
        <p className="mt-1 text-muted-foreground">
          Last 30 days across all your links.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
                  <s.icon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 font-display text-3xl font-bold">
                {s.value}
              </div>
              <div className="mt-1 text-xs font-medium text-primary">
                {s.change} vs last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Clicks over time</CardTitle>
          <CardDescription>
            Daily total clicks and unique visitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <AreaChart data={clicksOverTime}>
                <defs>
                  <linearGradient id="g-clicks" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--color-chart-1)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-chart-1)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="g-unique" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--color-chart-2)"
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-chart-2)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--color-muted-foreground)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--color-muted-foreground)"
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#g-clicks)"
                />
                <Area
                  type="monotone"
                  dataKey="unique"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  fill="url(#g-unique)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display">Recent links</CardTitle>
            <CardDescription>Your most recently created links</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Link to="/dashboard/links">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Short URL</TableHead>
                  <TableHead>Original</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.slice(0, 5).map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono font-medium">
                      {l.short}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {l.original}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {l.clicks.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          l.status === "active" ? "default" : "secondary"
                        }
                        className={
                          l.status === "active"
                            ? "bg-primary/15 text-primary hover:bg-primary/15"
                            : ""
                        }
                      >
                        {l.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {l.createdAt}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <FiMoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(l.short);
                              toast.success("Copied");
                            }}
                          >
                            <FiCopy className="mr-2 h-4 w-4" /> Copy
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <LuPencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <LuTrash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
