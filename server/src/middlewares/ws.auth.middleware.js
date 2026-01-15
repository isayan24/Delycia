import jwt from "jsonwebtoken";
import "dotenv/config";
const socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }
  //const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_SECRET, (err, user) => {
    if (err) {
      return next(new Error("Authentication error: Invalid or expired token"));
    } else {
      console.log("Token not expired!");
      next();
    }
    next();
  });
};

export default socketAuthMiddleware;
