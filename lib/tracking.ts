/**
 * Anonymous event tracking for ramen-style-finder.
 *
 * Configure via .env.local:
 *   NEXT_PUBLIC_COLLECT_API_URL=https://your-api-url/collect
 *
 * If NEXT_PUBLIC_COLLECT_API_URL is not set, all tracking functions
 * are silent no-ops — the quiz works exactly the same.
 *
 * No personally identifiable information (name, phone, email, etc.)
 * is ever collected or transmitted.
 */

const SOURCE = "ramen-style-finder";
const APP_VERSION = "1.0.0";

function getApiUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_COLLECT_API_URL;
  return url && url.trim() ? url.trim() : null;
}

/** Returns a stable anonymous session ID persisted in localStorage. */
export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = localStorage.getItem("ramen-session-id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("ramen-session-id", id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/** Creates a unique ID for a single quiz attempt. */
export function createQuizRunId(): string {
  return crypto.randomUUID();
}

/**
 * Sends an anonymous event to the collection API.
 * Always fire-and-forget — never throws, never blocks the UI.
 */
export async function trackEvent(
  eventType: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const apiUrl = getApiUrl();
  if (!apiUrl) return;

  const sessionId = getSessionId();
  const body = JSON.stringify({
    eventType,
    sessionId,
    createdAt: new Date().toISOString(),
    source: SOURCE,
    appVersion: APP_VERSION,
    page: typeof window !== "undefined" ? window.location.pathname : "/",
    payload,
  });

  try {
    await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch (err) {
    console.warn("[tracking] Failed to send event:", eventType, err);
  }
}

/** Tracks when the user begins a new quiz attempt. Fire-and-forget. */
export function trackQuizStarted(quizRunId: string): void {
  void trackEvent("quiz_started", {
    quizRunId,
    startedAt: new Date().toISOString(),
  });
}

export interface QuestionAnswerData {
  quizRunId: string;
  questionId: string;
  questionStage: string;
  questionText: string;
  leftLabel?: string;
  rightLabel?: string;
  answerValue: number | boolean;
  answerLabel?: string;
  answerDirection?: "left" | "right" | "neutral" | "selected" | "not_selected";
  questionIndex: number;
  /** True when this event is part of the final answer snapshot taken just before
   *  quiz_result is sent. Lets downstream analysis distinguish "user dragged
   *  slider at this moment" from "this was the question's final state". */
  isFinalSnapshot?: boolean;
}

/** Tracks a single question answer. Returns a Promise so callers can await all
 *  snapshot events before sending quiz_result (via Promise.allSettled). */
export function trackQuestionAnswer(data: QuestionAnswerData): Promise<void> {
  return trackEvent("question_answer", {
    ...data,
    answeredAt: new Date().toISOString(),
  });
}

export interface QuizResultData {
  quizRunId: string;
  typeCode: string;
  typeName: string;
  axes: {
    richnessAxis: number;
    brothBodyAxis: number;
    impactAxis: number;
    noodleBodyAxis: number;
  };
  topFlavorTags: string[];
  allergenWarnings: string[];
  recommendationSummary: string;
  answerCount: number;
}

/** Tracks the generated quiz result. Fire-and-forget. */
export function trackQuizResult(data: QuizResultData): void {
  void trackEvent("quiz_result", {
    ...data,
    resultGeneratedAt: new Date().toISOString(),
  });
}

export interface FeedbackData {
  quizRunId: string;
  typeCode: string;
  typeName: string;
  rating: number;
  comment?: string;
  axes: {
    richnessAxis: number;
    brothBodyAxis: number;
    impactAxis: number;
    noodleBodyAxis: number;
  };
}

/**
 * Sends a satisfaction feedback event.
 * Unlike other tracking functions, this one propagates API errors
 * so the UI can display an appropriate status to the user.
 * If no API URL is configured, resolves silently (treated as success).
 */
export async function sendFeedback(data: FeedbackData): Promise<void> {
  const apiUrl = getApiUrl();
  if (!apiUrl) return; // no API configured → treat as success

  const sessionId = getSessionId();
  const body = JSON.stringify({
    eventType: "feedback",
    sessionId,
    createdAt: new Date().toISOString(),
    source: SOURCE,
    appVersion: APP_VERSION,
    page: typeof window !== "undefined" ? window.location.pathname : "/",
    payload: { ...data, submittedAt: new Date().toISOString() },
  });

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
}
