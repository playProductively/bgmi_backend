import jsonwebtoken from "jsonwebtoken";
import createError from "http-errors";

const SignInAccess = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const options = {
      expiresIn: "30d",
      issuer: "vicky",
      audience: userId,
    };

    jsonwebtoken.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.log(err.message);
        reject(createError.InternalServerError());
      }
      resolve(token);
    });
  });
};

export const verifyToken = (req, res, next) => {
  const authToken = req.headers["authorization"];
  if (!authToken) return next(createError.Unauthorized());
  const token = authToken.split(" ")[1];
  jsonwebtoken.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err, payload) => {
      if (err) {
        const message =
          err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
        return next(createError.Unauthorized(message));
      }
      req.payload = payload;
      next();
    }
  );
};

export const signRefreshToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const options = {
      expiresIn: "1y",
      issuer: "vicky",
      audience: userId,
    };
    jsonwebtoken.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.log(err.message);
        reject(createError.InternalServerError());
      }
      resolve(token);
    });
  });
};

export const verifyRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    jsonwebtoken.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      (err, payload) => {
        if (err) return reject(createError.Unauthorized());
        resolve(payload.aud);
      }
    );
  });
};

export default SignInAccess;
