/**
 * Rounds a price UP to the nearest ₹50 for clean retail pricing.
 *
 * Examples:
 *   roundPrice(8438)  → 8450
 *   roundPrice(10556) → 10600
 *   roundPrice(14638) → 14650
 *   roundPrice(25313) → 25350
 *
 * @param price - Raw price as a number
 * @returns Price rounded UP to the nearest ₹50
 */
export function roundPrice(price: number): number {
  if (price <= 0 || isNaN(price)) return 0;
  return Math.ceil(price / 50) * 50;
}

/**
 * Format a price as an Indian-locale rupee string (whole rupees only).
 * Example: 12500 → "12,500"
 *
 * @param price - Price in rupees (will be rounded before formatting)
 * @returns Formatted string with comma separators
 */
export function formatPrice(price: number): string {
  if (isNaN(price) || price <= 0) return "0";
  return Math.round(price).toLocaleString("en-IN");
}

/**
 * Convert a whole-rupee amount to Razorpay paise.
 * Razorpay requires amounts in the smallest currency unit (paise = 1/100 of ₹).
 *
 * @param amount - Whole-rupee amount
 * @returns Integer paise value for Razorpay
 */
export function toRazorpayAmount(amount: number): number {
  return Math.round(amount) * 100;
}
