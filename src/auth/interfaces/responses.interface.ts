export interface RegisterResponse {
  message: string;
  data: {
    id: number;
    username: string;
    email: string;
  };
}

export interface LoginResponse {
  message: string;
  data: {
    token: string;
  };
}
