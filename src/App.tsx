import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import FileDrop from "./components/FileDrop";

function App() {
  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="md">
        <Typography variant="h4" marginTop={8} marginBottom={4}>
          Team Training Table Schedule Generator
        </Typography>
        <FileDrop />
      </Container>
    </React.Fragment>
  );
}

export default App;
