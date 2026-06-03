 /**
 * API Request & Response Logger with Whitelist and Blacklist filtering.
 */

// Blacklisted endpoints (sensitive paths or repetitive requests where logging is skipped)
const DEFAULT_BLACKLIST = [
  "/login",
  "/register",
  "/categories",
  "/products",
  "/orders",
];

// Whitelisted endpoints (only endpoints matching these patterns will be logged if not in blacklist)
const DEFAULT_WHITELIST = [
  "/cart",
  "/addresses",
  "/profile",
];

export class ApiLogger {
  private blacklist: string[];
  private whitelist: string[];

  constructor(blacklist = DEFAULT_BLACKLIST, whitelist = DEFAULT_WHITELIST) {
    this.blacklist = blacklist;
    this.whitelist = whitelist;
  }

  /**
   * Checks if an endpoint is allowed to be logged based on whitelist and blacklist.
   */
  private isLoggingAllowed(endpoint: string): boolean {
    const cleanEndpoint = endpoint.toLowerCase();

    // 1. Check Blacklist (Exclusion)
    const isBlacklisted = this.blacklist.some((blocked) =>
      cleanEndpoint.includes(blocked.toLowerCase())
    );
    if (isBlacklisted) {
      return false;
    }

    // 2. Check Whitelist (Inclusion - if whitelist is configured)
    if (this.whitelist.length > 0) {
      return this.whitelist.some((allowed) =>
        cleanEndpoint.includes(allowed.toLowerCase())
      );
    }

    return true;
  }

  /**
   * Sanitizes request payloads to avoid logging sensitive fields.
   */
  private sanitizeBody(body: any): any {
    if (!body) return body;
    try {
      const parsed = typeof body === "string" ? JSON.parse(body) : body;
      const sensitiveKeys = ["password", "password_confirmation", "token", "auth_token"];
      
      const sanitized = { ...parsed };
      for (const key of Object.keys(sanitized)) {
        if (sensitiveKeys.includes(key.toLowerCase())) {
          sanitized[key] = "[REDACTED]";
        }
      }
      return sanitized;
    } catch {
      return "[Unparsed payload]";
    }
  }

  /**
   * Logs an outgoing HTTP request.
   */
  logRequest(method: string, endpoint: string, headers: Headers, body?: any) {
    if (!this.isLoggingAllowed(endpoint)) {
      return;
    }

    const sanitizedBody = this.sanitizeBody(body);
    const timestamp = new Date().toLocaleTimeString();

    console.log(
      `%c[API Request] [${timestamp}] ${method} ➡️ ${endpoint}`,
      "color: #7C3AED; font-weight: bold;",
      {
        headers: Object.fromEntries(headers.entries()),
        payload: sanitizedBody,
      }
    );
  }

  /**
   * Logs an incoming HTTP response.
   */
  logResponse(method: string, endpoint: string, status: number, startTime: number, responseData?: any) {
    if (!this.isLoggingAllowed(endpoint)) {
      return;
    }

    const duration = Date.now() - startTime;
    const timestamp = new Date().toLocaleTimeString();
    const isSuccess = status >= 200 && status < 300;
    const statusColor = isSuccess ? "#10B981" : "#EF4444";
    const emoji = isSuccess ? "✅" : "❌";

    console.log(
      `%c[API Response] [${timestamp}] ${emoji} ${status} (${duration}ms) ${method} ⬅️ ${endpoint}`,
      `color: ${statusColor}; font-weight: bold;`,
      {
        status,
        duration: `${duration}ms`,
        data: responseData || "[No payload]",
      }
    );
  }
}

export const apiLogger = new ApiLogger();
