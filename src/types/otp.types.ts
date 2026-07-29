/**
 * Mobile OTP contract.
 *
 * Mirrors the backend's OtpSendResponse / OtpVerifyResponse. Note what the
 * client is never given: the code, and any count of failed attempts belonging to
 * someone else. The server is the only authority on whether a number is
 * verified -- `verificationToken` is the proof it issues, and the lead endpoint
 * re-checks its signature rather than trusting anything held in browser state.
 */
export interface OtpSendResponse {
  requestId: string;
  /** ISO timestamp; the code stops working at this moment. */
  expiresAt: string;
  /** ISO timestamp; Resend stays disabled until this passes. */
  resendAvailableAt: string;
  sendsRemainingThisHour: number;
  otpLength: number;
  maxAttempts: number;
}

export interface OtpVerifyResponse {
  verified: boolean;
  mobileNumber: string;
  verificationToken: string;
  attemptsRemaining: number;
}

/** Machine-readable refusal codes; the UI switches on these, not on prose. */
export type OtpFailureReason =
  | "INVALID_MOBILE"
  | "INVALID_REQUEST"
  | "RATE_LIMITED"
  | "COOLDOWN"
  | "EXPIRED"
  | "INCORRECT"
  | "BURNED"
  | "DELIVERY_FAILED"
  | "TEMPORARILY_UNAVAILABLE";

export interface OtpErrorBody {
  reason: OtpFailureReason;
  message: string;
  retryAt?: string;
  attemptsRemaining?: number;
}
