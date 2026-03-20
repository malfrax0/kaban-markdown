import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4A90E2', // Nebular Blue
    },
    secondary: {
      main: '#9013FE', // Stellar Purple
    },
    background: {
      default: '#0B0E14', // Deep Void
      paper: '#151922',
    },
    text: {
      primary: '#E0E6ED',
      secondary: '#AAB2C0',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 600 },
    h2: { fontSize: '1.5rem', fontWeight: 600 },
    h3: { fontSize: '1.25rem', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(30, 35, 45, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(74, 144, 226, 0.2)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});
