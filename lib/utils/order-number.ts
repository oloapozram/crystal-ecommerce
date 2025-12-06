/**
 * Generates a unique order number in the format: ORD-YYYYMMDD-XXXX
 * Where XXXX is a random 4-digit number
 *
 * @returns A unique order number string
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;

  // Generate a random 4-digit number
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `ORD-${datePart}-${randomPart}`;
}

/**
 * Validates if a string matches the order number format
 *
 * @param orderNumber - The order number to validate
 * @returns True if valid, false otherwise
 */
export function isValidOrderNumber(orderNumber: string): boolean {
  const orderNumberPattern = /^ORD-\d{8}-\d{4}$/;
  return orderNumberPattern.test(orderNumber);
}
