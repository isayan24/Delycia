import jwt from "jsonwebtoken";
import "dotenv/config";
const authMiddleware = (req, res, next) => {
  let token = req.headers.authorization;

  // Fallback to cookie if no header
  if (!token && req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  } else if (token && token.startsWith("Bearer")) {
    token = token.split(" ")[1];
  } else if (!token) {
    return res.status(401).json({ status: false, error: "Access Denied" });
  }

  try {
    jwt.verify(token, process.env.ACCESS_SECRET, (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ status: false, error: "Forbidden : Token expired." });
      } else {
        // Attach user to request for convenience if needed later, though not used by current code
        req.user = user;
        next();
      }
    });
  } catch (error) {
    return res.status(401).json({ status: false, error: "Invalid Token" });
  }
};

export default authMiddleware;
