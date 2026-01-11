import express from "express";
import { bookingValidate } from "../middlewares/validation.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { prisma } from "../prisma.js";
import { Status } from "../generated/prisma/enums.js";
import { updateBookingSchema } from "../schemas/booking.schema.js";

//all the booking routes in here must be protected
export const bookingRouter = express.Router();

bookingRouter.use(authMiddleware);

bookingRouter.post("/", bookingValidate, async (req, res) => {
  try {
    const { carName, days, rentPerDay } = req.body;
    const booking = await prisma.booking.create({
      data: {
        carName,
        days,
        rentPerDay,
        status: Status.Booked,
        user: {
          connect: { id: req.user?.userId! },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        message: "Booking created successfully",
        bookingId: booking.id,
        totalCost: booking.rentPerDay * booking.days,
      },
    });
  } catch (error) {
    res.send(400).json({
      success: false,
      data: {
        message: "invalid inputs",
      },
    });
  }
});

bookingRouter.get("/", async (req, res) => {
  try {
    const { summary, bookingId } = req.query;

    if (summary && bookingId) {
      return res.status(400).json({
        success: false,
        data: {
          message: "Cannot use summary and bookingId together",
        },
      });
    }

    if (summary) {
      const bookings = await prisma.booking.findMany({
        where: {
          userId: req.user?.userId!,
          status: {
            in: ["Booked", "Completed"],
          },
        },
        select: {
          days: true,
          rentPerDay: true,
        },
      });

      const totalCost = bookings.reduce(
        (sum, b) => sum + b.days * b.rentPerDay,
        0
      );

      return res.status(200).json({
        success: true,
        data: {
          userId: req.user?.userId,
          username: req.user?.username,
          totalBookings: bookings.length,
          totalAmountSpend: totalCost,
        },
      });
    }
    if (bookingId) {
      const booking = await prisma.booking.findFirst({
        where: {
          userId: req.user?.userId!,
          id: bookingId as string,
        },
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          data: {
            message: "bookingId not found",
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: booking,
      });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user?.userId!,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      data: {
        message: "bookingId not found",
      },
    });
  }
});

bookingRouter.put("/:bookingId", async (req, res) => {
  try {
    //check if the person who has requested is the owner
    const bookingId = req.params.bookingId;

    const parsed = updateBookingSchema.parse(req.body);

    if (Object.keys(parsed).length === 0) {
      return res.status(400).json({
        success: false,
        data: {
          message: "no fields provided to update",
        },
      });
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        data: {
          message: "booking not found",
        },
      });
    }

    //means a booking is there ..
    if (booking.userId != req.user?.userId!) {
      return res.status(403).json({
        success: false,
        data: {
          message: "booking does not belong to user",
        },
      });
    }

    //means booking is there and it belongs to the user

    const updateData = Object.fromEntries(
      Object.entries(parsed).filter(([_, value]) => value !== undefined)
    );

    const b1 = await prisma.booking.update({
      where: {
        id: bookingId,
        userId: req.user?.userId!,
      },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      data: {
        message: "Booking updated successfully",
        booking: {
          id: b1.id,
          car_name: b1.carName,
          days: b1.days,
          rent_per_day: b1.rentPerDay,
          status: b1.status,
          totalCost: b1.rentPerDay * b1.days,
        },
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: {
        message: "invalid inputs",
      },
    });
  }
});

bookingRouter.delete("/:bookingId", async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        data: {
          message: "booking not found",
        },
      });
    }

    //means a booking is there ..
    if (booking.userId != req.user?.userId!) {
      return res.status(403).json({
        success: false,
        data: {
          message: "booking does not belong to user",
        },
      });
    }

    //delete booking here

    await prisma.booking.delete({
      where: {
        id: bookingId,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        message: "Booking deleted successfully",
      },
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      data: {
        message: "something went wrong while deleting the booking",
      },
    });
  }
});
