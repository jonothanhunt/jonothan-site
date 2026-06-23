export function formatCustomDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const shortMonth = date.toLocaleString("en-GB", { month: "short" });
  const paddedDay = String(date.getUTCDate()).padStart(2, "0");
  return `${shortMonth} ${paddedDay}`;
}

export function getYear(dateString: string): number {
  return parseInt(dateString.split('-')[0], 10);
}
