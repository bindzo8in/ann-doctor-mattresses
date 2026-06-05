/**
 * Rounds a price to the nearest whole rupee.
 *
 * All customer-facing prices and payment amounts must be whole rupees.
 * Use this everywhere a monetary value is calculated or displayed.
 *
 * Examples:
 *   roundPrice(199.45)   → 199
 *   roundPrice(199.50)   → 200
 *   roundPrice(199.86)   → 200
 *   roundPrice(12499.15) → 12499
 *   roundPrice(12499.86) → 12500
 *
 * @param price - Raw price as a number (may contain decimals / paisa)
 * @returns Whole-rupee price (Math.round)
 */
export function roundPrice(price: number): number {
  return Math.round(price);
}

/**
 * Format a price as an Indian-locale rupee string (whole rupees only).
 * Example: 12500 → "12,500"
 *
 * @param price - Price in rupees (will be rounded before formatting)
 * @returns Formatted string with comma separators
 */
export function formatPrice(price: number): string {
  return roundPrice(price).toLocaleString("en-IN");
}

/**
 * Convert a whole-rupee amount to Razorpay paise.
 * Razorpay requires amounts in the smallest currency unit (paise = 1/100 of ₹).
 *
 * @param amount - Whole-rupee amount (will be rounded first)
 * @returns Integer paise value for Razorpay
 */
export function toRazorpayAmount(amount: number): number {
  return roundPrice(amount) * 100;
}
