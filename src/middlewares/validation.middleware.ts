import { type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ErrorResponse } from "../responses/error.js";
import { userRegistrationSchema } from "../schemas/user.schema.js";
import { bookingRegistrationSchema } from "../schemas/booking.schema.js";

export function validate(req: Request, res: Response, next: NextFunction) {
  try {
    userRegistrationSchema.parse({
      body: req.body,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ErrorResponse(res, 400, "invalid inputs");
    }
    next(error);
  }
}

export function bookingValidate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    bookingRegistrationSchema.parse({
      body: req.body,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ErrorResponse(res, 400, "invalid inputs");
    }
    next(error);
  }
}
