import type { ProviderId } from "@signhify/types";

interface CircuitState {
  failures: number;
  lastFailure: Date;
  isOpen: boolean;
}

const FAILURE_THRESHOLD = 3;
const RESET_TIMEOUT_MS = 60_000;

/**
 * Circuit breaker for LLM providers.
 * After FAILURE_THRESHOLD consecutive failures, the circuit "opens" and
 * the provider is skipped for RESET_TIMEOUT_MS before retrying.
 */
export class CircuitBreaker {
  private circuits = new Map<ProviderId, CircuitState>();

  /** Check if the circuit is open (provider should be skipped) */
  isOpen(providerId: ProviderId): boolean {
    const state = this.circuits.get(providerId);
    if (!state || !state.isOpen) return false;

    if (Date.now() - state.lastFailure.getTime() > RESET_TIMEOUT_MS) {
      state.isOpen = false;
      state.failures = 0;
      return false;
    }

    return true;
  }

  /** Record a failure for the given provider */
  recordFailure(providerId: ProviderId): void {
    const state = this.circuits.get(providerId) ?? {
      failures: 0,
      lastFailure: new Date(),
      isOpen: false,
    };
    state.failures++;
    state.lastFailure = new Date();
    if (state.failures >= FAILURE_THRESHOLD) {
      state.isOpen = true;
    }
    this.circuits.set(providerId, state);
  }

  /** Reset the circuit for a provider (e.g. after a successful call) */
  reset(providerId: ProviderId): void {
    this.circuits.set(providerId, {
      failures: 0,
      lastFailure: new Date(),
      isOpen: false,
    });
  }

  /** Get status of all circuits */
  getStatus(): Array<{
    providerId: ProviderId;
    failures: number;
    isOpen: boolean;
    lastFailure: Date;
  }> {
    return Array.from(this.circuits.entries()).map(([id, state]) => ({
      providerId: id,
      failures: state.failures,
      isOpen: state.isOpen,
      lastFailure: state.lastFailure,
    }));
  }
}
