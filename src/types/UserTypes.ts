import { Document, Schema } from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser {
  name: string;
  userId: string;
  email: string;
  role: UserRole;
  picture?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiryDate?: Date;
  sheets: [{ type: Schema.Types.ObjectId; ref: "Sheet" }];
}

export interface IUserDocument extends IUser, Document {}
