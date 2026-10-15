export type RegisterUserDto = {
  name: string;
  userName: string;
  email: string;
  password: string;
};

export type LoginUserDto = {
  email: string;
  password: string;
};

export enum UserPlan {
  FREE = "free",
  PRO = "pro",
  BUSINESS = "business",
}

export type PublicUserDto = {
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
export type CreateLinkDto = {
  title: string;
  shortCode: string;
  originalUrl: string;
  expiresAt: string;
};

export type PublicLinkDto = {
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
export type LinkWithClickCountAndUniqueCount = LinkWithClickCount & {
  uniqueClicks: number;
};
export type RecentLinks = LinkWithClickCountAndUniqueCount[];

// API Responses
type RestAPIResponse<T> = {
  status: number;
  message: string;
  data: T;
  success: boolean;
};

// User Response
export type RegisterUserResponse = RestAPIResponse<void>;
export type LoginUserResponse = RestAPIResponse<void>;
export type GetUserResponse = RestAPIResponse<PublicUserDto>;

// Link Response
export type GetLinkResponse = RestAPIResponse<PublicLinkDto[]>;
export type CreateLinkResponse = RestAPIResponse<void>;
export type GetUserLinksResponse = RestAPIResponse<
  LinkWithClickCountAndUniqueCount[]
>;

// Analytics Response
export type OverviewStatsResponse = RestAPIResponse<OverviewStats>;
export type ClicksOverTimeResponse = RestAPIResponse<ClicksOverTime>;
export type RecentLinksResponse = RestAPIResponse<RecentLinks>;
