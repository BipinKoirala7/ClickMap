export type Link = {
  id: string;
  short: string;
  original: string;
  clicks: number;
  uniqueVisitors: number;
  createdAt: string;
  status: "active" | "expired" | "paused";
};

export const links: Link[] = [
  {
    id: "lk_01",
    short: "clk.mp/launch",
    original: "https://acme.com/product-launch-2026-spring-collection",
    clicks: 12480,
    uniqueVisitors: 8421,
    createdAt: "2026-06-12",
    status: "active",
  },
  {
    id: "lk_02",
    short: "clk.mp/docs",
    original: "https://docs.acme.com/getting-started",
    clicks: 5320,
    uniqueVisitors: 3110,
    createdAt: "2026-06-09",
    status: "active",
  },
  {
    id: "lk_03",
    short: "clk.mp/sale",
    original: "https://shop.acme.com/summer-sale",
    clicks: 9870,
    uniqueVisitors: 6543,
    createdAt: "2026-06-05",
    status: "active",
  },
  {
    id: "lk_04",
    short: "clk.mp/webinar",
    original: "https://acme.com/events/webinar-june",
    clicks: 2140,
    uniqueVisitors: 1980,
    createdAt: "2026-06-01",
    status: "paused",
  },
  {
    id: "lk_05",
    short: "clk.mp/beta",
    original: "https://beta.acme.com/signup",
    clicks: 780,
    uniqueVisitors: 612,
    createdAt: "2026-05-22",
    status: "expired",
  },
  {
    id: "lk_06",
    short: "clk.mp/hire",
    original: "https://careers.acme.com",
    clicks: 3320,
    uniqueVisitors: 2880,
    createdAt: "2026-05-18",
    status: "active",
  },
  {
    id: "lk_07",
    short: "clk.mp/blog",
    original: "https://blog.acme.com/how-we-scaled-redis",
    clicks: 4421,
    uniqueVisitors: 3201,
    createdAt: "2026-05-10",
    status: "active",
  },
];

export const clicksOverTime = Array.from({ length: 30 }).map((_, i) => ({
  date: `Jun ${i + 1}`,
  clicks: Math.round(400 + Math.sin(i / 3) * 180 + Math.random() * 220),
  unique: Math.round(220 + Math.sin(i / 4) * 100 + Math.random() * 140),
}));

export const deviceBreakdown = [
  { name: "Desktop", value: 5820 },
  { name: "Mobile", value: 4210 },
  { name: "Tablet", value: 980 },
];

export const geoBreakdown = [
  { country: "United States", clicks: 4820 },
  { country: "Germany", clicks: 1920 },
  { country: "Brazil", clicks: 1450 },
  { country: "Japan", clicks: 1110 },
  { country: "United Kingdom", clicks: 980 },
];

export const recentEvents = Array.from({ length: 8 }).map((_, i) => ({
  id: `ev_${i}`,
  time: `${2 + i} min ago`,
  country: ["US", "DE", "BR", "JP", "GB", "FR"][i % 6],
  device: ["Desktop", "Mobile", "Tablet"][i % 3],
  browser: ["Chrome", "Safari", "Firefox", "Edge"][i % 4],
  referrer: ["twitter.com", "google.com", "direct", "linkedin.com"][i % 4],
}));

export function getLink(id: string) {
  return links.find((l) => l.id === id);
}
