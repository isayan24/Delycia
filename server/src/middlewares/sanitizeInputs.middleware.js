import { body, param, query, validationResult } from "express-validator";
import validator from "validator";

/**
 * Sanitize a value to prevent XSS, SQL injection, and NoSQL injection attacks
 * @param {*} value - The value to sanitize
 * @returns {*} - The sanitized value
 */
const sanitizeValue = (value) => {
  // Only sanitize if value is a string
  if (typeof value !== 'string') {
    return value;
  }

  // Trim whitespace
  let sanitized = value.trim();

  // XSS Protection: Escape HTML characters
  sanitized = validator.escape(sanitized);

  // NoSQL Injection Protection: Remove MongoDB operators
  // These patterns are commonly used in NoSQL injection attacks
  const noSqlPatterns = [
    /\$where/gi,
    /\$ne/gi,
    /\$gt/gi,
    /\$gte/gi,
    /\$lt/gi,
    /\$lte/gi,
    /\$in/gi,
    /\$nin/gi,
    /\$or/gi,
    /\$and/gi,
    /\$not/gi,
    /\$nor/gi,
    /\$exists/gi,
    /\$type/gi,
    /\$regex/gi,
    /\$expr/gi,
    /\$jsonSchema/gi,
    /\$mod/gi,
    /\$text/gi,
    /\$elemMatch/gi
  ];

  noSqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // SQL Injection Protection: Remove common SQL injection patterns
  // Note: Parameterized queries are the primary defense, this is additional protection
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(--|;|\/\*|\*\/|xp_|sp_)/gi,
    /('|(\\')|(\\")|(\\\\))/gi
  ];

  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized;
};

/**
 * Recursively sanitize nested objects and arrays
 * @param {*} obj - The object to sanitize
 * @returns {*} - The sanitized object
 */
const deepSanitize = (obj) => {
  if (typeof obj === 'string') {
    return sanitizeValue(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Sanitize both key and value
        const sanitizedKey = sanitizeValue(key);
        sanitized[sanitizedKey] = deepSanitize(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
};

const sanitizeInput = [
  // Sanitize body parameters (including nested objects and arrays)
  body("*")
    .customSanitizer((value) => {
      return deepSanitize(value);
    }),

  // Sanitize URL parameters
  param("*")
    .customSanitizer((value) => {
      return sanitizeValue(value);
    }),

  // Sanitize query parameters
  query("*")
    .customSanitizer((value) => {
      return sanitizeValue(value);
    }),

  // Validation result handler
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: false,
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    next();
  },
];

export default sanitizeInput;
