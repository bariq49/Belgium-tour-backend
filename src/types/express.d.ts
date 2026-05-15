import { IAdmin } from "../models/Admin";
import { IUser } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      admin?: IAdmin;
      user?: IUser;
      sessionId?: string;
    }
  }
}
