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

// API Responses

type RestAPIResponse<T> = {
  status: number;
  message: string;
  data: T;
  success: boolean;
};

type RegisterUserResponse = RestAPIResponse<void>;
type LoginUserResponse = RestAPIResponse<void>;
type GetUserResponse = RestAPIResponse<PublicUserDto>;

type GetLinksResponse = RestAPIResponse<PublicLinkDto[]>;

export type {
  PublicUserDto,
  RegisterUserDto,
  RegisterUserResponse,
  LoginUserDto,
  LoginUserResponse,
  GetUserResponse,
  PublicLinkDto,
  GetLinksResponse,
};
