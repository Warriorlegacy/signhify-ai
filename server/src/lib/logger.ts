import pino from "pino";
import pinoHttp from "pino-http";
import type { IncomingMessage } from "http";

const level =
  process.env.LOG_LEVEL ??
  (process.env.NODE_ENV === "production" ? "info" : "debug");

export const logger = pino({
  level,
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:HH:MM:ss",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});

/**
 * Create a child logger with a named context.
 */
export function createContextLogger(context: string) {
  return logger.child({ context });
}

/**
 * HTTP request logging middleware factory.
 * Use with Express: app.use(createHttpLogger());
 */
export function createHttpLogger() {
  return pinoHttp({
    logger,
    autoLogging: {
      ignore: (req: IncomingMessage) => req.url === "/api/health",
    },
  });
}

export default logger;
