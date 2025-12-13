import { createTheme } from "@mui/material/styles";

/**
 * BioWeaver Admin Theme - "Memory Lane"
 * 
 * A warm, elegant theme inspired by vintage manuscripts and parchment paper.
 * Perfect for a biography/memoir generation application.
 */

// Color Palette
export const colors = {
  // Primary - Rich Sepia Tones
  primary: {
    main: "#8B5A2B", // Saddle Brown - warm, nostalgic
    light: "#A67B5B",
    dark: "#6B4423",
    contrastText: "#FFFFFF",
  },
  // Secondary - Deep Teal (for actions)
  secondary: {
    main: "#2E6B6B",
    light: "#4A8B8B",
    dark: "#1D4848",
    contrastText: "#FFFFFF",
  },
  // Background colors
  background: {
    default: "#F7F3EE", // Warm off-white parchment
    paper: "#FFFDF9", // Slightly warmer white for cards
  },
  // Accent colors
  accent: {
    gold: "#D4A373", // Warm gold - for highlights
    cream: "#FEFAE0", // Cream - for subtle backgrounds
    sage: "#606C38", // Sage green - for success states
    rust: "#BC6C25", // Rust - for warnings
    wine: "#9B2335", // Deep wine - for errors
  },
  // Text colors
  text: {
    primary: "#2C2C2C", // Almost black
    secondary: "#5C5C5C", // Medium gray
    muted: "#8A8A8A", // Light gray
    inverse: "#FFFDF9",
  },
  // Status colors
  status: {
    polished: "#4A7C59", // Forest green
    pending: "#B8860B", // Dark goldenrod
    error: "#9B2335",
    success: "#2E6B6B",
  },
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
    error: {
      main: colors.accent.wine,
    },
    warning: {
      main: colors.accent.rust,
    },
    success: {
      main: colors.accent.sage,
    },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    h1: {
      fontFamily: "'Merriweather', 'Georgia', serif",
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: "'Merriweather', 'Georgia', serif",
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontFamily: "'Merriweather', 'Georgia', serif",
      fontWeight: 600,
    },
    h4: {
      fontFamily: "'Merriweather', 'Georgia', serif",
      fontWeight: 500,
    },
    h5: {
      fontFamily: "'Merriweather', 'Georgia', serif",
      fontWeight: 500,
    },
    h6: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
      color: colors.text.secondary,
    },
    body1: {
      lineHeight: 1.7,
    },
    body2: {
      lineHeight: 1.6,
      color: colors.text.secondary,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0 1px 3px rgba(139, 90, 43, 0.08)",
    "0 2px 6px rgba(139, 90, 43, 0.1)",
    "0 4px 12px rgba(139, 90, 43, 0.12)",
    "0 8px 24px rgba(139, 90, 43, 0.14)",
    "0 12px 32px rgba(139, 90, 43, 0.16)",
    "0 16px 40px rgba(139, 90, 43, 0.18)",
    "0 20px 48px rgba(139, 90, 43, 0.20)",
    "0 24px 56px rgba(139, 90, 43, 0.22)",
    "0 28px 64px rgba(139, 90, 43, 0.24)",
    "0 32px 72px rgba(139, 90, 43, 0.26)",
    "0 36px 80px rgba(139, 90, 43, 0.28)",
    "0 40px 88px rgba(139, 90, 43, 0.30)",
    "0 44px 96px rgba(139, 90, 43, 0.32)",
    "0 48px 104px rgba(139, 90, 43, 0.34)",
    "0 52px 112px rgba(139, 90, 43, 0.36)",
    "0 56px 120px rgba(139, 90, 43, 0.38)",
    "0 60px 128px rgba(139, 90, 43, 0.40)",
    "0 64px 136px rgba(139, 90, 43, 0.42)",
    "0 68px 144px rgba(139, 90, 43, 0.44)",
    "0 72px 152px rgba(139, 90, 43, 0.46)",
    "0 76px 160px rgba(139, 90, 43, 0.48)",
    "0 80px 168px rgba(139, 90, 43, 0.50)",
    "0 84px 176px rgba(139, 90, 43, 0.52)",
    "0 88px 184px rgba(139, 90, 43, 0.54)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "10px 20px",
          fontWeight: 500,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(139, 90, 43, 0.15)",
          },
        },
        contained: {
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
            backgroundColor: "rgba(139, 90, 43, 0.04)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(139, 90, 43, 0.08)",
          border: "1px solid rgba(139, 90, 43, 0.08)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(139, 90, 43, 0.12)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 2px 8px rgba(139, 90, 43, 0.08)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: "rgba(139, 90, 43, 0.08)",
          padding: "16px",
        },
        head: {
          fontWeight: 600,
          backgroundColor: colors.background.default,
          color: colors.text.primary,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "rgba(212, 163, 115, 0.06) !important",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            backgroundColor: colors.background.paper,
            "& fieldset": {
              borderColor: "rgba(139, 90, 43, 0.15)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(139, 90, 43, 0.3)",
            },
            "&.Mui-focused fieldset": {
              borderColor: colors.primary.main,
              borderWidth: "2px",
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#2C2420",
          borderRight: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.paper,
          color: colors.text.primary,
          boxShadow: "0 1px 3px rgba(139, 90, 43, 0.08)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "2px 8px",
          "&.Mui-selected": {
            backgroundColor: "rgba(212, 163, 115, 0.2)",
            "&:hover": {
              backgroundColor: "rgba(212, 163, 115, 0.25)",
            },
          },
          "&:hover": {
            backgroundColor: "rgba(212, 163, 115, 0.1)",
          },
        },
      },
    },
  },
});

export default theme;

