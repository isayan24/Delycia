import jwt from "jsonwebtoken";
import "dotenv/config";
const authMiddleware = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer"))
    return res.status(401).json({ status: false, error: "Access Denied" });

  try {
    token = token.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_SECRET, (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ status: false, error: "Forbidden : Token expired." });
      } else {
        // console.log("Token not expired!");
        next();
      }
    });
  } catch (error) {
    return res.status(401).json({ status: false, error: "Invalid Token" });
  }
};

export default authMiddleware;
