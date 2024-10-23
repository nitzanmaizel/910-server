/**
 * Processes raw sheet data into an array of row objects, handling duplicate headers.
 * @param {any[][]} data - The raw data from a sheet tab (array of arrays).
 * @returns {{ data: any[]; headers: string[] }} - The processed data and headers.
 */
export const processSheetData = (
  data: any[][]
): { data: any[]; headers: string[] } => {
  if (!data || data.length === 0) {
    return { data: [], headers: [] };
  }

  const [headersRow, ...rows] = data;

  const headerCounts: { [key: string]: number } = {};
  const headers: string[] = headersRow.map((header, idx) => {
    let headerName = header !== null ? String(header) : "";
    if (headerName === "") {
      headerName = `Column${idx}`;
    }
    if (headerCounts[headerName] !== undefined) {
      headerCounts[headerName] += 1;
      headerName = `${headerName}_${headerCounts[headerName]}`;
    } else {
      headerCounts[headerName] = 0;
    }
    return headerName;
  });

  const processedData = rows.map((row, index) => {
    const rowData: any = { id: index };
    headers.forEach((header: string, i: number) => {
      rowData[header] = row[i] !== undefined ? row[i] : null;
    });
    return rowData;
  });

  return { data: processedData, headers };
};

/**
 * Groups data by a specified column.
 * @param {any[]} data - The processed data array.
 * @param {string} column - The column name to group by.
 * @returns {{ [key: string]: any[] }} - The grouped data.
 */
export const groupDataByColumn = (
  data: any[],
  column: string
): { [key: string]: any[] } => {
  return data.reduce((acc: { [key: string]: any[] }, row: any) => {
    const key = row[column] !== null ? String(row[column]) : "";
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});
};
