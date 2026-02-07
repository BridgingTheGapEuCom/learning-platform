import { JwtPayload as StandardJwtPayload } from 'jsonwebtoken';

export interface JwtPayload extends StandardJwtPayload {
  email: string;
  sub: string;
}
