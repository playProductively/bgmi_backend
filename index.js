import connectDb from "./config/connectdb.js";
import express from "express";
import createError from "http-errors";
import dotenv from "dotenv";
import authRouter from "./Routes/Auth.route.js";
import morgan from "morgan";
import { verifyToken } from "./config/jwt_helper.js";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
connectDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());

app.get("/", verifyToken, (req, res) => res.send("home is running"));
app.use("/auth", authRouter);
app.use((req, res, next) => {
  next(createError.NotFound("This route does not exist."));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

app.listen(PORT, () => {
  console.log(`port listening on ${PORT}`);
});
