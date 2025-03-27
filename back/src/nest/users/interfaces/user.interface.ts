export interface UserData {
  id?: number;
  email: string;
  name: string;
  surname: string;
  password?: string;
  role?: string;
  refreshToken?: string;
}
