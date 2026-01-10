import "dotenv/config";

import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { authRouter } from "./routers/auth.router.js";
import { bookingRouter } from "./routers/booking.router.js";

const app = express();

app.use(express.json());

app.use("/auth", authRouter);
app.use("/bookings", bookingRouter);

app.listen(3000, () => {
  console.log("server started at port 3000");
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
