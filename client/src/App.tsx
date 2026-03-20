import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";
import { HomePage } from "./pages/HomePage";
import { BoardPage } from "./pages/BoardPage";
import { AuthProvider } from "./components/AuthProvider";
import { AuthGate } from "./components/AuthGate";
import { LogoutButton } from "./components/LogoutButton";
import { TokenInitializer } from "./components/TokenInitializer";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AuthGate>
          <TokenInitializer />
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/board/:projectId" element={<BoardPage />} />
            </Routes>
          </Router>
          <LogoutButton />
        </AuthGate>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
