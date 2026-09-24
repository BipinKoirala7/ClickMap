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
  createdAt: Date;
  updatedAt: Date;
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

export type {
  PublicUserDto,
  RegisterUserDto,
  RegisterUserResponse,
  LoginUserDto,
  LoginUserResponse,
};
