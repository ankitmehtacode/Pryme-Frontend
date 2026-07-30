import React from "react";
import { OtpVerifier } from "./OtpVerifier";

/**
 * Mobile OTP verification for the application form.
 *
 * Now a thin wrapper over {@link OtpVerifier}, which is this component
 * generalised to handle email as well -- OtpVerifier was built from this file,
 * so the behaviour, styling and server contract are identical. Kept as its own
 * export so the loan application form's call site is unchanged.
 */
interface Props {
  mobileNumber: string;
  /** Verified already (e.g. a logged-in user whose number is on their profile). */
  verified: boolean;
  /** Receives the server-signed proof. Store it; submission needs it. */
  onVerified: (token: string, mobileNumber: string) => void;
  disabled?: boolean;
}

export const MobileOtpVerifier: React.FC<Props> = ({
  mobileNumber,
  verified,
  onVerified,
  disabled = false,
}) => (
  <OtpVerifier
    channel="mobile"
    value={mobileNumber}
    verified={verified}
    onVerified={onVerified}
    disabled={disabled}
  />
);
