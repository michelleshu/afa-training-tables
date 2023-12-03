import React, { ReactElement, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import FileDrop from "./components/FileDrop";
import Meal from "./types/Meal";
import Team from "./types/Team";
import { TEAM_MAPPING, formatMeals, isTeamCode } from "./util/teamParser";

function App() {
  const [teamDetails, setTeamDetails] = useState<Record<string, Team>>({});
  const [mealsByTeam, setMealsByTeam] = useState<Record<string, Meal[]>>({});
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [teamSchedule, setTeamSchedule] = useState<ReactElement>(<></>);

  const teamMenuItems = () => {
    const teamCodes = Object.keys(mealsByTeam);
    const sortedCodesAndNames = teamCodes
      .map((teamCode) =>
        isTeamCode(teamCode)
          ? { teamCode, teamName: TEAM_MAPPING[teamCode] }
          : null
      )
      .filter((result) => result != null)
      .sort((a, b) => {
        if (!a || !b) {
          return 0;
        } else if (a.teamName < b.teamName) {
          return -1;
        } else if (a.teamName > b.teamName) {
          return 1;
        } else {
          return 0;
        }
      });

    return sortedCodesAndNames.map((sorted) =>
      sorted && sorted.teamCode && sorted.teamName ? (
        <MenuItem key={sorted.teamCode} value={sorted.teamCode}>
          {sorted.teamName}
        </MenuItem>
      ) : null
    );
  };

  const generateTeamSchedule = (
    teamDetails: Team,
    meals: Meal[]
  ): ReactElement => {
    const breakfasts = meals.filter((meal) => meal.type === "Breakfast");
    const dinners = meals.filter((meal) => meal.type === "Dinner");

    const breakfastTime = breakfasts.length ? breakfasts[0].time : "";
    const dinnerTime = dinners.length ? dinners[0].time : "";

    const formattedBreakfasts = formatMeals(breakfasts);
    const formattedDinners = formatMeals(dinners);

    return (
      <div>
        <p>
          <strong>{teamDetails.name}</strong>
        </p>
        <p>
          Total: {teamDetails.headcount} {teamDetails.specialDiets}
        </p>
        {breakfastTime ? <p>Breakfast ({breakfastTime})</p> : ""}
        <ul>
          {formattedBreakfasts.map((breakfast, i) => (
            <li key={i}>{breakfast}</li>
          ))}
        </ul>

        {dinnerTime ? <p>Dinner ({dinnerTime}) - Falcon Room</p> : ""}
        <ul>
          {formattedDinners.map((dinner, i) => (
            <li key={i}>{dinner}</li>
          ))}
        </ul>
      </div>
    );
  };

  const handleTeamSelection = (event: SelectChangeEvent) => {
    const teamCode = event.target.value as string;
    setSelectedTeam(teamCode);
    if (teamCode && teamDetails[teamCode] && mealsByTeam[teamCode]) {
      setTeamSchedule(
        generateTeamSchedule(teamDetails[teamCode], mealsByTeam[teamCode])
      );
    }
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="md">
        <Typography variant="h4" marginTop={8} marginBottom={4}>
          Training Tables Team Schedule Generator
        </Typography>
        <FileDrop
          updateTeamDetails={setTeamDetails}
          updateMealsByTeam={setMealsByTeam}
        />
        <Box marginY={4}>
          <FormControl fullWidth>
            <InputLabel id="team-label">Team</InputLabel>
            <Select
              labelId="team-label"
              id="team-select"
              value={selectedTeam}
              label="Team"
              disabled={Object.keys(mealsByTeam).length < 1}
              onChange={handleTeamSelection}
            >
              {teamMenuItems()}
            </Select>
          </FormControl>
        </Box>
        <Box marginTop={2} marginBottom={16}>
          {teamSchedule}
        </Box>
      </Container>
    </React.Fragment>
  );
}

export default App;
