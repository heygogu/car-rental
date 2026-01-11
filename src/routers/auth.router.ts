import express, { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { validate } from "../middlewares/validation.middleware.js";
import { prisma } from "../prisma.js";
import jwt from "jsonwebtoken";

export const authRouter = express.Router();

authRouter.post("/signup", validate, async (req: Request, res: Response) => {
  try {
    //means it is a new user
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await prisma.user.create({
      data: {
        username: req.body.username,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        message: "User created successfully",
        userId: user.id,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        data: { message: "username already exists" },
      });
    }
    throw error;
  }
});

authRouter.post("/login", validate, async (req: Request, res: Response) => {
  try {
    //at this point the req.body has the username and the password
    const { username, password } = req.body;
    //get the user of the same username

    const user = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        data: {
          message: "user does not exist",
        },
      });
    }
    //verify the password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        data: {
          message: "incorrect password",
        },
      });
    }

    //it means the user is present and the password is also correct so generate jwt

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET!
    );

    return res.status(200).json({
      success: true,
      data: {
        message: "Login successful",
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: { message: "Internal server error" },
    });
  }
});
