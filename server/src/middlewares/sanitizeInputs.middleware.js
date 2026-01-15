import { body, param, query, validationResult } from "express-validator";

const sanitizeInput = [
  body("*")
    .customSanitizer((value, { req, path }) => {
      // Only sanitize if value is a string
      if (typeof value === 'string') {
        return value.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }
      // Return non-string values as-is (arrays, objects, numbers, etc.)
      return value;
    }),

  param("*").trim().escape(),
  query("*").trim().escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  },
];

export default sanitizeInput;
