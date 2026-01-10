import type { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "../responses/error.js";
import jwt, { type JwtPayload } from "jsonwebtoken";

interface AuthPayload extends JwtPayload {
  userId: string;
  username: string;
}
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const headers = req.headers;
    const bearer = headers["authorization"];
    //bearer se split mardo

    if (!bearer) {
      ErrorResponse(res, 401, "Authorization header missing");
    }

    let token = bearer?.split(" ")[1];
    if (!token) {
      ErrorResponse(res, 401, "Token missing after Bearer");
    }

    //now we need to verify the token

    const payload = jwt.verify(
      token || "",
      process.env.JWT_SECRET!
    ) as AuthPayload;

    req.user = {
      userId: payload.userId,
      username: payload.userName,
    };

    if (!payload.userId || !payload.username) {
      throw new Error("Invalid payload");
    }

    next();
    //means everything is valid
  } catch (error) {
    ErrorResponse(res, 401, "Token Invalid");
    next(error);
  }
}
