/**
 * AUTH MODE CONFIGURATION
 * ──────────────────────────────────────────────────────────────
 * Controls the customer login method for the client app.
 *
 * false = WhatsApp Magic Link login (default — requires OTP quota)
 * true  = Direct phone + name login  (backup — no OTP needed)
 *
 * ── To activate backup login ──
 *    Change `USE_DIRECT_LOGIN` to `true`
 *
 * ── To restore WhatsApp login ──
 *    Change `USE_DIRECT_LOGIN` to `false`
 * ──────────────────────────────────────────────────────────────
 */

export const USE_DIRECT_LOGIN = true

export const isDirectAuth = (): boolean => USE_DIRECT_LOGIN
export const isMagicLinkAuth = (): boolean => !USE_DIRECT_LOGIN
