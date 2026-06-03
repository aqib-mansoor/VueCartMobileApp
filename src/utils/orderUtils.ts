/**
 * Format order ID to a unique, professional e-commerce order number.
 * e.g., ORD-20260603-0005
 */
export const formatOrderNumber = (id: number | string | null | undefined, dateString?: string): string => {
  if (!id) return "ORD-PENDING";
  
  const date = dateString ? new Date(dateString) : new Date();
  
  // Format as YYYYMMDD safely
  let yyyymmdd = "";
  try {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    yyyymmdd = `${year}${month}${day}`;
  } catch {
    // Fallback date
    yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  }
  
  const paddedId = String(id).padStart(4, "0");
  return `ORD-${yyyymmdd}-${paddedId}`;
};
