/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";

export function verifyToken(token: string): string | JwtPayload {
  const secret = process.env.JWT_SECRET as string;

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }

  try {
    return jwt.verify(token, secret);
  } catch (error: any) {
    // 🔍 Si le token a expiré → on lève une erreur 401
    if (error instanceof TokenExpiredError) {
      const err = new Error("Invalid or expired token!");
      (err as any).status = 401;
      throw err;
    }

    // 🔍 Si le token est invalide → on lève aussi une 401
    const err = new Error("Invalid or expired token!");
    (err as any).status = 401;
    throw err;
  }
}
