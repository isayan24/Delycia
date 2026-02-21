import { body, param, query, validationResult } from "express-validator";

/**
 * Sanitize a value to prevent XSS and injection attacks.
 * 
 * IMPORTANT: This middleware does NOT use validator.escape() (HTML entity encoding)
 * because our backend stores data in MySQL with parameterized queries, which already
 * prevents SQL injection. HTML entity encoding corrupts legitimate data like URLs,
 * JSON strings, and any text containing quotes or slashes.
 * 
 * Instead, we use targeted stripping of dangerous HTML tags, event handlers,
 * and protocol handlers to prevent stored XSS.
 * 
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

  // ── XSS Protection ─────────────────────────────────────────────────────
  // Strip dangerous HTML tags (script, iframe, object, embed, etc.)
  // This prevents stored XSS without corrupting URLs or data
  sanitized = sanitized.replace(
    /<\s*\/?\s*(script|iframe|object|embed|form|input|textarea|button|select|style|link|meta|base|applet|svg|math)[^>]*>/gi,
    ''
  );

  // Remove javascript: and data: protocol handlers in href/src contexts
  sanitized = sanitized.replace(/\b(javascript|vbscript)\s*:/gi, '');

  // Remove on* event handler attributes (onclick, onerror, onload, etc.)
  sanitized = sanitized.replace(/\bon[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // ── NoSQL Injection Protection ──────────────────────────────────────────
  // Remove MongoDB operators commonly used in NoSQL injection attacks
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

  // NOTE: SQL injection protection is handled by parameterized queries.
  // We intentionally do NOT strip SQL keywords here because:
  // 1. Parameterized queries already prevent SQL injection
  // 2. Stripping common words like "SELECT", "UPDATE" corrupts legitimate
  //    user content (e.g., descriptions containing these words)

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
