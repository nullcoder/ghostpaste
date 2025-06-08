/**
 * Server-side Turnstile verification utilities
 */

interface TurnstileVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
}

/**
 * Verify a Turnstile token on the server side
 * @param token - The token received from the client
 * @param secretKey - The Turnstile secret key
 * @param remoteIp - Optional remote IP address
 * @returns Verification result
 */
export async function verifyTurnstileToken(
  token: string,
  secretKey: string,
  remoteIp?: string
): Promise<TurnstileVerifyResponse> {
  const formData = new URLSearchParams();
  formData.append("secret", secretKey);
  formData.append("response", token);
  if (remoteIp) {
    formData.append("remoteip", remoteIp);
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Turnstile verification failed: ${response.statusText}`);
    }

    const result = (await response.json()) as TurnstileVerifyResponse;
    return result;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return {
      success: false,
      "error-codes": ["verification-failed"],
    };
  }
}

/**
 * Check if Turnstile is enabled (has secret key configured)
 */
export function isTurnstileEnabled(env: {
  TURNSTILE_SECRET_KEY?: string;
}): boolean {
  return Boolean(env.TURNSTILE_SECRET_KEY && env.TURNSTILE_SECRET_KEY.trim());
}

/**
 * Get human-readable error message for Turnstile error codes
 */
export function getTurnstileErrorMessage(errorCodes?: string[]): string {
  if (!errorCodes || errorCodes.length === 0) {
    return "Verification failed";
  }

  const errorMessages: Record<string, string> = {
    "missing-input-secret": "The secret parameter was not passed",
    "invalid-input-secret": "The secret parameter was invalid",
    "missing-input-response": "The response parameter was not passed",
    "invalid-input-response": "The response parameter is invalid",
    "bad-request": "The request was rejected because it was malformed",
    "timeout-or-duplicate":
      "The response parameter has already been validated before",
    "internal-error":
      "An internal error happened while validating the response",
  };

  const messages = errorCodes
    .map((code) => errorMessages[code] || code)
    .filter(Boolean);

  return messages.join(", ");
}
