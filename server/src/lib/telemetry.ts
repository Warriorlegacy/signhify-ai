import {
  trace,
  metrics,
  SpanStatusCode,
  type Span,
  type Counter,
  type Histogram,
} from "@opentelemetry/api";
import { createContextLogger } from "./logger";

const log = createContextLogger("telemetry");

let tracer: ReturnType<typeof trace.getTracer> | null = null;
let requestCounter: Counter | undefined;
let llmCallCounter: Counter | undefined;
let llmLatencyHistogram: Histogram | undefined;
let memoryOpCounter: Counter | undefined;

const enabled = process.env.OTEL_ENABLED === "true";

/**
 * Initialize OpenTelemetry tracing and metrics.
 * Gracefully degrades when OTEL_ENABLED is not set.
 */
export function initTelemetry(): void {
  const serviceName = process.env.OTEL_SERVICE_NAME ?? "signhify-server";
  const serviceVersion = process.env.npm_package_version ?? "3.0.0";

  if (!enabled) {
    log.info("OpenTelemetry disabled (set OTEL_ENABLED=true to enable)");
    return;
  }

  try {
    tracer = trace.getTracer(serviceName, serviceVersion);
    const meter = metrics.getMeter(serviceName, serviceVersion);

    requestCounter = meter.createCounter("http.requests.total", {
      description: "Total number of HTTP requests",
    });
    llmCallCounter = meter.createCounter("llm.calls.total", {
      description: "Total number of LLM API calls",
    });
    llmLatencyHistogram = meter.createHistogram("llm.call.duration.ms", {
      description: "LLM call duration in milliseconds",
    });
    memoryOpCounter = meter.createCounter("memory.operations.total", {
      description: "Total memory operations (add, search, get)",
    });

    log.info({ serviceName, serviceVersion }, "OpenTelemetry initialized");
  } catch (err: any) {
    log.warn(
      { err: err.message },
      "Failed to initialize telemetry — continuing without",
    );
    tracer = null;
  }
}

// ─── Tracing Helpers ──────────────────────────────────────────────

export function startSpan(
  name: string,
  attributes?: Record<string, string>,
): Span | null {
  if (!tracer) return null;
  return tracer.startSpan(name, { attributes });
}

export function endSpan(span: Span | null, error?: Error): void {
  if (!span) return;
  if (error) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    span.recordException(error);
  } else {
    span.setStatus({ code: SpanStatusCode.OK });
  }
  span.end();
}

// ─── Metrics Helpers ──────────────────────────────────────────────

export function recordRequest(
  method: string,
  path: string,
  statusCode: number,
): void {
  requestCounter?.add(1, { method, path, status_code: String(statusCode) });
}

export function recordLLMCall(
  provider: string,
  model: string,
  durationMs: number,
  success: boolean,
): void {
  llmCallCounter?.add(1, { provider, model, success: String(success) });
  llmLatencyHistogram?.record(durationMs, { provider, model });
}

export function recordMemoryOp(op: string, success: boolean): void {
  memoryOpCounter?.add(1, { operation: op, success: String(success) });
}
