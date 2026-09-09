export const csvStr2Array = (data: string, delimiter = ",") => {
  const rows = data.split(/\r?\n/).filter((row) => row.trim() !== "");
  const headers = rows.shift()?.split(delimiter) ?? [];

  const result = rows.map((row) => {
    const values = row.split(delimiter);

    const storeKeyValue = headers.reduce(
      // (obj: { [key: string]: number | string }, title, index) => {
      (obj: Record<string, string | number>, title, index) => {
        const rawValue = values[index] ?? "";
        obj[title.trim()] = isNaN(Number(rawValue))
          ? rawValue
          : Number(rawValue);
        return obj;
      },
      {},
    );

    return storeKeyValue;
  });

  return result;
};
