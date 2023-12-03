import { WorkBook, utils } from "xlsx";
import SpreadsheetRow from "../types/SpreadsheetRow";

const getWeeklySheets = (workbook: WorkBook) => {
  const sheetNames = workbook.SheetNames;
  const weeklySheetNames = sheetNames.filter((sheetName) =>
    /([A-Za-z])+.+([0-9]){1,2}[ ]?(-){1}[ ]?([0-9]){1,2}/.test(sheetName)
  );
  return weeklySheetNames.map((sheetName) => workbook.Sheets[sheetName]);
};

const isValidRow = (row: (string | number)[]) => {
  return (
    row.length === 14 &&
    row[0] &&
    typeof row[0] === "string" &&
    row[0].length > 0 &&
    row[1] &&
    typeof row[1] === "number" &&
    row[1] > 0 &&
    row[2] &&
    typeof row[2] === "string" &&
    row[2].length > 0 &&
    row[3] &&
    typeof row[3] === "string" &&
    row[3].length > 0 &&
    row[4] &&
    typeof row[4] === "string" &&
    row[4].length > 0 &&
    row[5] &&
    typeof row[5] === "string" &&
    row[5].length > 0
  );
};

const toSpreadsheetRowOrNull: (
  row: (string | number)[]
) => SpreadsheetRow | null = (row) => {
  if (isValidRow(row)) {
    return {
      day: row[0] as string,
      date: row[1] as number,
      time: row[2] as string,
      headcount: row[3] as string,
      caterer: row[4] as string,
      menu: row[5] as string,
    };
  }
  return null;
};

export const parseSpreadsheet = (workbook: WorkBook) => {
  const weeklySheets = getWeeklySheets(workbook);

  const rows = weeklySheets.flatMap((sheet) =>
    utils.sheet_to_json<string[]>(sheet, { header: 1 })
  );

  return rows
    .map((row) => toSpreadsheetRowOrNull(row))
    .filter((row): row is SpreadsheetRow => row != null);
};
