export interface IUser {
  UserID?: number;
  email: string;
  username: string;
  displayName?: string;
  profilePicUrl?: string;
  role?: "patient" | "caretaker";
  medBoxID?: string;
}

export interface IUserForm {
  email?: string;
  username?: string;
  password?: string;
  displayName?: string;
  profilePicUrl?: string;
  role?: "patient" | "caretaker";
  medBoxID?: string;
  medBoxPassword?: string;
}