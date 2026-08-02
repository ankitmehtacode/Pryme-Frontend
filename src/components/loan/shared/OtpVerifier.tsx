import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Phone, Mail, CheckCircle2, Loader2, RotateCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrymeAPI } from "@/lib/api";
import type { OtpErrorBody, OtpSendResponse } from "@/types/otp.types";

/**
 * OTP verification for either channel.
 *
 * This is the mobile verifier generalised, not a second implementation: the
 * timing, attempt handling and error states below were built and debugged once
 * against SMS, and email needed exactly the same behaviour with a different
 * destination. MobileOtpVerifier is now a thin wrapper over this, so the loan
 * application form is unchanged.
 *
 * Deliberate properties, unchanged from the original:
 *
 *  - The component holds no authority. Every limit (10-minute validity, 5 sends
 *    per hour, 5 wrong guesses) is enforced server side; the countdowns here are
 *    presentation of timestamps the server returned. A user who edits state in
 *    devtools gains nothing -- `onVerified` hands up a server-signed token, and
 *    that token is what registration is checked against.
 *  - Timers are driven off absolute timestamps, not decremented counters, so a
 *    backgrounded tab (where browsers throttle intervals) resumes with the
 *    correct remaining time instead of a frozen clock.
 *  - Every failure has a distinct, recoverable state: wrong code shows attempts
 *    left, an expired or burned code pushes the user to resend rather than
 *    leaving a dead input on screen.
 */

type Phase = "idle" | "sending" | "entry" | "verifying" | "verified";

export type OtpChannel = "mobile" | "email";

interface Props {
  channel: OtpChannel;
  /** The destination being proven: a 10-digit number, or an email address. */
  value: string;
  /** Verified already (e.g. a returning user whose contact is on their profile). */
  verified: boolean;
  /** Receives the server-signed proof. Store it; submission needs it. */
  onVerified: (token: string, value: string) => void;
  disabled?: boolean;
  /**
   * True on the registration form only. The server then refuses to send a code
   * to a contact that already has an account, so the user is told at the Verify
   * button rather than after filling in the rest of the form -- and no SMS
   * credit is spent on an attempt that could never succeed.
   */
  forSignup?: boolean;
}

const isValidMobile = (m: string) => /^[6-9]\d{9}$/.test(m || "");
// Deliberately permissive, matching the backend: the real test of an address is
// whether the code arrives at it.
const isValidEmail = (e: string) => /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test((e || "").trim());

const isValidFor = (channel: OtpChannel, value: string) =>
  channel === "email" ? isValidEmail(value) : isValidMobile(value);

/** Seconds between now and an ISO timestamp, floored at 0. */
const secondsUntil = (iso?: string | null): number => {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 1000));
};

const mmss = (total: number) => {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const OtpVerifier: React.FC<Props> = ({
  channel,
  value,
  verified,
  onVerified,
  disabled = false,
  forSignup = false,
}) => {
  const [phase, setPhase] = useState<Phase>(verified ? "verified" : "idle");
  const [session, setSession] = useState<OtpSendResponse | null>(null);
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [expiresIn, setExpiresIn] = useState(0);
  const [resendIn, setResendIn] = useState(0);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const otpLength = session?.otpLength ?? 4;

  const isEmail = channel === "email";

  useEffect(() => {
    if (verified) setPhase("verified");
  }, [verified]);

  // A changed destination invalidates any session in flight -- the code was sent
  // to the old one and must not appear to apply to the new one.
  useEffect(() => {
    if (phase === "verified") return;
    setPhase("idle");
    setSession(null);
    setDigits([]);
    setError(null);
    setAttemptsLeft(null);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // One ticker for both countdowns, recomputed from absolute timestamps.
  useEffect(() => {
    if (!session || phase === "verified") return;
    const tick = () => {
      setExpiresIn(secondsUntil(session.expiresAt));
      setResendIn(secondsUntil(session.resendAvailableAt));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [session, phase]);

  const readError = async (e: unknown): Promise<OtpErrorBody | null> => {
    const anyErr = e as { body?: OtpErrorBody; response?: Response; message?: string };
    if (anyErr?.body?.reason) return anyErr.body;
    try {
      if (anyErr?.response) return (await anyErr.response.json()) as OtpErrorBody;
    } catch {
      /* fall through to the generic message below */
    }
    return null;
  };

  const requestCode = useCallback(
    async (isResend: boolean) => {
      if (!isValidFor(channel, value) || disabled) return;
      setPhase("sending");
      setError(null);
      try {
        const res = isEmail
          ? isResend
            ? await PrymeAPI.resendEmailOtp(value, forSignup)
            : await PrymeAPI.sendEmailOtp(value, forSignup)
          : isResend
            ? await PrymeAPI.resendMobileOtp(value, forSignup)
            : await PrymeAPI.sendMobileOtp(value, forSignup);
        setSession(res);
        setDigits(new Array(res.otpLength).fill(""));
        setAttemptsLeft(res.maxAttempts);
        setPhase("entry");
        window.setTimeout(() => inputsRef.current[0]?.focus(), 50);
      } catch (e) {
        const body = await readError(e);
        setError(body?.message ?? "We couldn't send the code. Please try again.");
        setPhase(session ? "entry" : "idle");
      }
    },
    [channel, value, disabled, session, isEmail, forSignup]
  );

  const submit = useCallback(
    async (code: string) => {
      if (!session || code.length !== otpLength) return;
      setPhase("verifying");
      setError(null);
      try {
        // One verify endpoint for both channels: the requestId already knows
        // which channel issued the code.
        const res = await PrymeAPI.verifyMobileOtp(session.requestId, code);
        setPhase("verified");
        onVerified(res.verificationToken, res.mobileNumber);
      } catch (e) {
        const body = await readError(e);
        setError(body?.message ?? "That code isn't correct.");
        if (typeof body?.attemptsRemaining === "number") setAttemptsLeft(body.attemptsRemaining);
        // A dead code must not leave a stale input focused as if retrying could work.
        if (body?.reason === "BURNED" || body?.reason === "EXPIRED") {
          setSession((s) => (s ? { ...s, expiresAt: new Date(0).toISOString() } : s));
          setDigits(new Array(otpLength).fill(""));
          setPhase("entry");
        } else {
          setDigits(new Array(otpLength).fill(""));
          setPhase("entry");
          window.setTimeout(() => inputsRef.current[0]?.focus(), 50);
        }
      }
    },
    [session, otpLength, onVerified]
  );

  const setDigit = (index: number, digitValue: string) => {
    const clean = digitValue.replace(/\D/g, "");
    if (!clean) {
      setDigits((d) => d.map((x, i) => (i === index ? "" : x)));
      return;
    }
    // Paste of a whole code into any box fills the row, which is how people
    // actually move a code across from their SMS or mail app -- and it is also
    // the path SMS autofill takes, since the browser drops the entire code into
    // the one-time-code box in a single change event.
    if (clean.length > 1) {
      const next = clean.slice(0, otpLength).split("");
      const filled = new Array(otpLength).fill("").map((_, i) => next[i] ?? "");
      setDigits(filled);
      const full = filled.join("");
      // `filled`, not `full`: "1234".includes("") is always true for a string,
      // so testing the joined code here never submitted.
      if (full.length === otpLength && !filled.includes("")) void submit(full);
      inputsRef.current[Math.min(next.length, otpLength - 1)]?.focus();
      return;
    }
    const updated = digits.map((x, i) => (i === index ? clean : x));
    setDigits(updated);
    if (index < otpLength - 1) inputsRef.current[index + 1]?.focus();
    const full = updated.join("");
    if (full.length === otpLength && !updated.includes("")) void submit(full);
  };

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < otpLength - 1) inputsRef.current[index + 1]?.focus();
  };

  const expired = session != null && expiresIn === 0 && phase === "entry";
  const sendsLeft = session?.sendsRemainingThisHour ?? null;
  const outOfSends = sendsLeft === 0;

  const helper = useMemo(() => {
    if (expired) return "That code expired. Request a new one.";
    if (phase === "entry") {
      const dest = isEmail ? value : `+91 ${value}`;
      return `Code sent to ${dest} · expires in ${mmss(expiresIn)}`;
    }
    return null;
  }, [expired, phase, value, expiresIn, isEmail]);

  if (phase === "verified") {
    return (
      <div className="flex items-center gap-1.5 mt-1 animate-in fade-in">
        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
        <span className="text-[11px] font-semibold text-primary">
          {isEmail ? "Email Verified" : "Mobile Verified"}
        </span>
      </div>
    );
  }

  if (!isValidFor(channel, value)) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-1 mt-1 space-y-2">
      {phase === "idle" || phase === "sending" ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || phase === "sending"}
          className="w-full h-9 text-xs font-semibold border-primary/30 text-primary hover:bg-primary hover:text-white transition-all"
          onClick={() => void requestCode(false)}
        >
          {phase === "sending" ? (
            <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Sending…</>
          ) : (
            <>
              {isEmail ? <Mail className="w-3 h-3 mr-1.5" /> : <Phone className="w-3 h-3 mr-1.5" />}
              Verify
            </>
          )}
        </Button>
      ) : (
        <>
          <div className="flex items-center gap-2" role="group"
               aria-label={isEmail ? "Enter the code sent by email" : "Enter the code sent by SMS"}>
            {Array.from({ length: otpLength }).map((_, i) => (
              <input
                key={i}
                ref={(el) => { inputsRef.current[i] = el; }}
                value={digits[i] ?? ""}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                onFocus={(e) => e.target.select()}
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={otpLength}
                disabled={phase === "verifying" || expired}
                aria-label={`Digit ${i + 1} of ${otpLength}`}
                // border-border is --brand-border at 91.4% lightness -- a divider
                // tone. On the bg-secondary/50 fill these slots use, it left the
                // boxes with no discernible edge. An empty input has nothing but
                // its outline to say "type here", so this one needs real contrast
                // rather than the subtle value the rest of the surface uses.
                className="w-11 h-11 text-center text-base font-bold rounded-xl bg-secondary/50 dark:bg-white/[0.03] border border-slate-300 dark:border-white/[0.18] text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-inset focus:ring-primary/10 disabled:opacity-50"
              />
            ))}
            {phase === "verifying" && (
              <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => void requestCode(true)}
              disabled={resendIn > 0 || phase === "verifying" || outOfSends}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary disabled:text-muted-foreground/60 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCw className="w-3 h-3" />
              {outOfSends
                ? "Resend limit reached"
                : resendIn > 0
                  ? `Resend in ${mmss(resendIn)}`
                  : "Resend code"}
            </button>
            {sendsLeft != null && !outOfSends && (
              <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                {sendsLeft} left this hour
              </span>
            )}
          </div>
        </>
      )}

      {helper && !error && (
        <p className="text-[10px] text-muted-foreground/70">{helper}</p>
      )}

      {error && (
        <div className="flex items-start gap-1.5">
          <ShieldAlert className="w-3 h-3 text-destructive shrink-0 mt-0.5" />
          <p className="text-[10px] font-medium text-destructive">
            {error}
            {attemptsLeft != null && attemptsLeft > 0 && phase === "entry" && (
              <span className="text-muted-foreground/70"> · {attemptsLeft} attempts left</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
