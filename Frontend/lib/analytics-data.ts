export const stats = [
  {
    label: "Total Clicks",
    value: "48,212",
    change: "12.4%",
    trend: "up",
    icon: "clicks",
  },
  {
    label: "Unique Visitors",
    value: "31,098",
    change: "8.1%",
    trend: "up",
    icon: "visitors",
  },
  {
    label: "Top Referrer",
    value: "twitter.com",
    change: "2.3%",
    trend: "up",
    icon: "referrer",
  },
  {
    label: "Top Location",
    value: "United States",
    change: "1.1%",
    trend: "down",
    icon: "location",
  },
] as const;

export const clicksOverTime = Array.from({ length: 30 }, (_, i) => {
  const clicks = Math.round(
    480 + 130 * Math.sin(i / 2.2) + 60 * Math.cos(i / 1.1),
  );
  const unique = Math.round(clicks * 0.6 + 40 * Math.sin(i / 3));
  return { date: `Jun ${i + 1}`, clicks, unique };
});

export const devices = [
  { device: "desktop", sessions: 5400, fill: "var(--color-desktop)" },
  { device: "mobile", sessions: 3900, fill: "var(--color-mobile)" },
  { device: "tablet", sessions: 700, fill: "var(--color-tablet)" },
];

export const browsers = [
  { browser: "Chrome", sessions: 6400 },
  { browser: "Safari", sessions: 3000 },
  { browser: "Firefox", sessions: 1150 },
  { browser: "Edge", sessions: 850 },
];

export const topCountries = [
  { label: "United States", value: 4820 },
  { label: "Germany", value: 1920 },
  { label: "Brazil", value: 1450 },
  { label: "Japan", value: 1110 },
  { label: "United Kingdom", value: 980 },
];

export const topReferrers = [
  { source: "twitter.com", clicks: 3820 },
  { source: "google.com", clicks: 3110 },
  { source: "linkedin.com", clicks: 2240 },
  { source: "direct", clicks: 1980 },
  { source: "github.com", clicks: 1240 },
  { source: "newsletter", clicks: 1080 },
];

export const topLinks = [
  { slug: "clk.mp/launch", status: "active", clicks: 12480, unique: 8421 },
  { slug: "clk.mp/sale", status: "active", clicks: 9870, unique: 6543 },
  { slug: "clk.mp/docs", status: "active", clicks: 5320, unique: 3110 },
  { slug: "clk.mp/blog", status: "active", clicks: 4421, unique: 3201 },
  { slug: "clk.mp/hire", status: "active", clicks: 3320, unique: 2880 },
  { slug: "clk.mp/webinar", status: "paused", clicks: 2140, unique: 1980 },
] as const;
