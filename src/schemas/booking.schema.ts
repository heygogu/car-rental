import { z } from "zod";

export const bookingRegistrationSchema = z
  .object({
    body: z.object({
      carName: z.string().min(2, "Carname must be at least 2 characters"),
      days: z.number().max(365).min(1),
      rentPerDay: z.number().max(2000),
    }),
  })
  .strict();

export type bookingRegistrationBody = z.infer<
  typeof bookingRegistrationSchema
>["body"];

export const updateBookingSchema = z
  .object({
    carName: z.string().optional(),
    days: z.number().int().positive().max(365).optional(),
    rentPerDay: z.number().int().max(2000).positive().optional(),
    status: z.enum(["Booked", "Completed", "Cancelled"]).optional(),
  })
  .strict();
