import moment from "moment";
import Meal from "../types/Meal";
import Team from "../types/Team";
import SpreadsheetRow from "../types/SpreadsheetRow";

export const TEAM_CODES: string[] = [
  "BA",
  "BOX",
  "CH",
  "DV",
  "FB",
  "FN",
  "GO",
  "HO",
  "LAX",
  "MBB",
  "MGYM",
  "MSOC",
  "MSW",
  "MTEN",
  "RI",
  "TR",
  "VO",
  "WBB",
  "WGYM",
  "WP",
  "WR",
  "WSOC",
  "WSW",
  "WTEN",
  "XC",
];
export const TEAM_MAPPING = {
  BA: "Baseball",
  BOX: "Boxing",
  CH: "Spirit",
  DV: "Diving",
  FB: "Football",
  FN: "Fencing",
  GO: "Golf",
  HO: "Hockey",
  LAX: "Lacrosse",
  MBB: "Men's Basketball",
  MGYM: "Men's Gymnastics",
  MSOC: "Men's Soccer",
  MSW: "Men's Swimming",
  MTEN: "Men's Tennis",
  RI: "Rifle",
  TR: "Track and Field",
  VO: "Volleyball",
  WBB: "Women's Basketball",
  WGYM: "Women's Gymnastics",
  WP: "Water Polo",
  WR: "Wrestling",
  WSOC: "Women's Soccer",
  WSW: "Women's Swimming",
  WTEN: "Women's Tennis",
  XC: "Cross Country",
};

export function isTeamCode(
  teamCode: PropertyKey
): teamCode is keyof typeof TEAM_MAPPING {
  return Object.prototype.hasOwnProperty.call(TEAM_MAPPING, teamCode);
}

const getTeamCodesFromHeadcount = (headcount: string) => {
  return TEAM_CODES.map((teamCode) => {
    return headcount.search(teamCode) > -1 ? teamCode : null;
  }).filter((code): code is string => code != null);
};

const getMealForTeamFromSpreadsheetRow = (
  teamCode: string,
  row: SpreadsheetRow
) => {
  let mealTime;
  const teamTime = row.time.match(
    new RegExp(`([0-9]){3,4}( )?\\(${teamCode}\\)`)
  );
  if (teamTime && teamTime[0].length) {
    mealTime = teamTime[0]
      .substring(0, teamTime[0].length - teamCode.length - 2)
      .trim();
  } else {
    const timeRange = row.time.match(
      new RegExp(`([0-9]){3,4}( )?-( )?([0-9]){3,4}`)
    );
    if (timeRange && timeRange[0].length) {
      mealTime = timeRange[0].trim();
    }
  }

  if (!mealTime) {
    throw new Error(`Could not detect meal time in cell: ${row.time}`);
  }

  let mealType;
  if (row.time.search("Breakfast") > -1) {
    mealType = "Breakfast";
  } else if (row.time.search("Dinner") > -1) {
    mealType = "Dinner";
  } else if (teamTime && teamTime[0].length) {
    mealType = "Breakfast";
  }

  if (!mealType) {
    throw new Error(
      `Could not detect meal type (breakfast or dinner) in cell: ${row.time}`
    );
  }

  // Fix Microsoft leap year bug and convert to milliseconds
  const formattedDate = moment(
    new Date((row.date - (25567 + 1)) * 86400 * 1000)
  ).format("DD MMM");

  return {
    day: row.day,
    date: formattedDate,
    time: mealTime,
    type: mealType as "Breakfast" | "Dinner",
    catererName: row.caterer.split(/\r?\n/)[0],
    mealDescription: row.menu.split(/\r?\n/)[0],
  };
};

const processMealFromRow = (
  row: SpreadsheetRow,
  mealsByTeam: Record<string, Meal[]>
) => {
  const teamCodes = getTeamCodesFromHeadcount(row.headcount);
  if (!teamCodes.length) {
    return;
  }

  const meal = getMealForTeamFromSpreadsheetRow(teamCodes[0], row);

  for (const teamCode of teamCodes) {
    if (!mealsByTeam[teamCode]) {
      mealsByTeam[teamCode] = [];
    }
    mealsByTeam[teamCode].push(meal);
  }
};

const getTeamHeadcountFromHeadcount = (
  headcountText: string,
  teamCode: string
) => {
  // Special case for Football
  if (teamCode === "FB") {
    const matchedText = headcountText.match(/(FB)(.*)([0-9]){1,3}/);
    if (matchedText && matchedText[0]) {
      const matchedHeadcount = matchedText[0].match(/([0-9]){1,3}/);
      if (matchedHeadcount && matchedHeadcount[0]) {
        return parseInt(matchedHeadcount[0]);
      }
    }
  }

  const matchedText = headcountText.match(
    new RegExp(`(${teamCode})( )?-( )?([0-9]){1,3}`)
  );
  if (matchedText && matchedText[0]) {
    return parseInt(
      matchedText[0].replace(teamCode, "").replace("-", "").trim()
    );
  }
  return 0;
};

const getTeamSpecialDietsFromHeadcount = (
  headcountText: string,
  teamCode: string
) => {
  // Special case for Football
  if (teamCode === "FB") {
    const matchedText = headcountText.match(/(FB)(.*)(\r?\n)?( )?\(.+\)/);
    if (matchedText && matchedText[0]) {
      const matchedSpecialDiets = matchedText[0].match(/\(.+\)/);
      if (matchedSpecialDiets && matchedSpecialDiets[0]) {
        return matchedSpecialDiets[0];
      }
    }
  }

  const matchedText = headcountText.match(
    new RegExp(`(${teamCode})( )?-( )?([0-9]){1,3}( )?(\r?\n)?( )?\\(.+\\)`)
  );
  if (matchedText && matchedText[0]) {
    return matchedText[0].substring(matchedText[0].indexOf("(") - 1);
  }
  return "";
};

const getTeamDetail = (rows: SpreadsheetRow[], teamCode: string) => {
  if (isTeamCode(teamCode)) {
    const row = rows.find((row) =>
      getTeamCodesFromHeadcount(row.headcount).includes(teamCode)
    );

    if (row) {
      const headcount = getTeamHeadcountFromHeadcount(row.headcount, teamCode);
      const specialDiets = getTeamSpecialDietsFromHeadcount(
        row.headcount,
        teamCode
      );

      return {
        code: teamCode,
        name: TEAM_MAPPING[teamCode],
        headcount,
        specialDiets,
      };
    }
  }
  return null;
};

export const getTeamDetails = (rows: SpreadsheetRow[], teamCodes: string[]) => {
  const teamDetails: Record<string, Team> = {};
  for (const teamCode of teamCodes) {
    if (isTeamCode(teamCode)) {
      const teamDetail = getTeamDetail(rows, teamCode);
      if (teamDetail) {
        teamDetails[teamCode] = teamDetail;
      }
    }
  }

  return teamDetails;
};

export const getMealsByTeam = (rows: SpreadsheetRow[]) => {
  const mealsByTeam: Record<string, Meal[]> = {};
  rows.forEach((row) => {
    processMealFromRow(row, mealsByTeam);
  });

  return mealsByTeam;
};

export const formatMeals = (meals: Meal[]) => {
  return meals.map(
    (meal) =>
      `${meal.day}, ${meal.date}: ${meal.catererName} - ${meal.mealDescription}`
  );
};
