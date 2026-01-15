// lib/logger-dynamic.ts

// Define log metadata interface
interface LogMetadata {
  [key: string]: any;
}

// Define logger interface
interface SafeLogger {
  info: (message: string, meta?: LogMetadata) => Promise<void>;
  error: (message: string, meta?: LogMetadata) => Promise<void>;
  warn: (message: string, meta?: LogMetadata) => Promise<void>;
  debug: (message: string, meta?: LogMetadata) => Promise<void>;
}

// Helper function to format log messages with timestamp
const formatLogMessage = (
  level: string,
  message: string,
  meta?: LogMetadata
) => {
  const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  return `${timestamp} [${level}]: ${message}${metaStr}`;
};

// Safe logger implementation
const logger: SafeLogger = {
  info: async (message: string, meta?: LogMetadata) => {
    console.log(formatLogMessage("INFO", message, meta));
  },

  error: async (message: string, meta?: LogMetadata) => {
    console.error(formatLogMessage("ERROR", message, meta));
  },

  warn: async (message: string, meta?: LogMetadata) => {
    console.warn(formatLogMessage("WARN", message, meta));
  },

  debug: async (message: string, meta?: LogMetadata) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(formatLogMessage("DEBUG", message, meta));
    }
  },
};

export default logger;
export type { LogMetadata, SafeLogger };
