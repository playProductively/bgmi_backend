import { Router } from "express";
import createError from "http-errors";
import User from "../models/User.model.js";
import authScema from "../config/joiValidator.js";
import SignInAccess, {
  signRefreshToken,
  verifyRefreshToken,
} from "../config/jwt_helper.js";

const router = Router();
let dt = new Date();
let expIn = dt.setDate(dt.getDate() + 30);

router.post("/register", async (req, res, next) => {
  try {
    const result = await authScema.validateAsync(req.body);
    const userExist = await User.findOne({ email: result.email });
    if (userExist)
      throw createError.Conflict(`${result.email} is already registered.`);
    const user = new User(result);
    const savedUser = await user.save();

    const accessToken = await SignInAccess(savedUser.id);
    const refreshToken = await signRefreshToken(savedUser.id);

    return res.json({
      accessToken,
      refreshToken,
      id: savedUser.id,
      expiresIn: expIn,
      email: savedUser.email,
    });
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const result = await authScema.validateAsync(req.body);
    const user = await User.findOne({ email: result.email });
    if (!user) throw createError.NotFound("This mail is not registered");
    const isValidPassword = await user.isValidPassword(result.password);
    if (!isValidPassword)
      throw createError.Unauthorized("Invalid Username/Password");

    const accessToken = await SignInAccess(user.id);
    const refreshToken = await signRefreshToken(user.id);
    return res.json({
      accessToken,
      refreshToken,
      id: user.id,
      expiresIn: expIn,
      email: user.email,
    });
  } catch (error) {
    if (error.isJoi === true)
      return next(createError.BadRequest("Invalid Email/Password"));
    next(error);
  }
});

router.post("/refresh-token", async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw createError.BadRequest();
  const userId = await verifyRefreshToken(refreshToken);
  const accessToken = await SignInAccess(userId);
  const refToken = await signRefreshToken(userId);
  res.send({ accessToken, refreshToken: refToken });
});

router.delete("/logout", async (req, res, next) => {
  res.send("logout route");
});

export default router;
