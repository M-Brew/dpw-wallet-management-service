import { IUserPayload } from "types/custom";

declare global {
  namespace Express {
    export interface Request {
      user?: IUserPayload;
    }
  }
}
