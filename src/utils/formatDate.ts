export function formatCustomDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day || 1));
  const monthName = date.toLocaleString("en-GB", { month: "long" }).toUpperCase();
  const currentYear = new Date().getUTCFullYear();
  if (year === currentYear) {
    return monthName;
  }
  return `${monthName} '${String(year).slice(-2)}`;
}

export function getYear(dateString: string): number {
  return parseInt(dateString.split('-')[0], 10);
}
