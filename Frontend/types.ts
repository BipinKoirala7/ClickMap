type RegisterUserDto = {
  name: string;
  userName: string;
  email: string;
  password: string;
};

type LoginUserDto = {
  email: string;
  password: string;
};

enum UserPlan {
  FREE = "free",
  PRO = "pro",
  BUSINESS = "business",
}

type PublicUserDto = {
  name: string;
  email: string;
  userName: string;
  plan: UserPlan;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

// Link
type PublicLinkDto = {
  id: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  title: string;
  shortCode: string;
  originalUrl: string;
  expiresAt: string;
};

// Analytics
export type OverviewStats = {
  total_links: number;
  prev_total_links: number;
  total_clicks: number;
  prev_total_clicks: number;
  total_active_links: number;
  prev_total_active_links: number;
  click_rate: number;
  prev_click_rate: number;
};

export type ClicksOverTime = {
  date: string;
  clickCount: number;
  visitorCount: number;
}[];

export type LinkWithClickCount = PublicLinkDto & { clicks: number };
export type LinkWithClickCountAndUniqueClicks = LinkWithClickCount & {
  uniqueClicks: number;
};
export type RecentLinks = LinkWithClickCount[];

// API Responses
type RestAPIResponse<T> = {
  status: number;
  message: string;
  data: T;
  success: boolean;
};

// User Response
type RegisterUserResponse = RestAPIResponse<void>;
type LoginUserResponse = RestAPIResponse<void>;
type GetUserResponse = RestAPIResponse<PublicUserDto>;

// Link Response
type GetLinksResponse = RestAPIResponse<PublicLinkDto[]>;

// Analytics Response
type OverviewStatsResponse = RestAPIResponse<OverviewStats>;
type ClicksOverTimeResponse = RestAPIResponse<ClicksOverTime>;

export type {
  PublicUserDto,
  RegisterUserDto,
  RegisterUserResponse,
  LoginUserDto,
  LoginUserResponse,
  GetUserResponse,
  PublicLinkDto,
  GetLinksResponse,
  OverviewStatsResponse,
  ClicksOverTimeResponse,
};
