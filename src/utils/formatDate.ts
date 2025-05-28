export function formatCustomDate(dateString: string) {
  // Ensure date is parsed correctly across all platforms by explicitly creating a UTC date
  // and then converting to local time
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  
  const localDay = date.getDate();
  const localMonth = date.toLocaleString("en-GB", { month: "short" }); // e.g. "Jan"
  const localYear = `'${date.getFullYear().toString().slice(-2)}`; // e.g. "'25"

  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return `${n}th`;
    switch (n % 10) {
      case 1:
        return `${n}st`;
      case 2:
        return `${n}nd`;
      case 3:
        return `${n}rd`;
      default:
        return `${n}th`;
    }
  };

  return `${getOrdinal(localDay)} ${localMonth} ${localYear}`;
}
