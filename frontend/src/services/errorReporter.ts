import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export type ErrorReportPayload = {
  source: string;
  message: string;
  stack?: string;
  metadata?: Record<string, unknown>;
};

export async function reportError(payload: ErrorReportPayload): Promise<void> {
  if (!BACKEND_URL) return;

  try {
    await axios.post(`${BACKEND_URL}/api/error-notification`, payload, { timeout: 5000 });
  } catch {
    // Prevent recursive errors from reporting failures.
  }
}
