import { Layout, LayoutProps, Menu, MenuProps, AppBar, AppBarProps, Sidebar } from "react-admin";
import { Box, Typography, useMediaQuery, Theme, alpha, IconButton, Tooltip } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import ArticleIcon from "@mui/icons-material/Article";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import GitHubIcon from "@mui/icons-material/GitHub";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { colors } from "../theme";

// Custom Menu with branded sidebar
function CustomMenu(props: MenuProps) {
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Brand Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${alpha("#FFFDF9", 0.08)}`,
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${colors.accent.gold} 0%, ${colors.primary.main} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 12px ${alpha(colors.accent.gold, 0.3)}`,
            }}
          >
            <AutoStoriesIcon sx={{ color: "#fff", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontFamily: "'Merriweather', serif",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: colors.accent.gold,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              BioWeaver
            </Typography>
            <Typography
              sx={{
                fontSize: "0.65rem",
                color: alpha("#FFFDF9", 0.5),
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                fontWeight: 500,
              }}
            >
              Admin Panel
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Menu Items */}
      <Box sx={{ flex: 1, py: 1 }}>
        <Menu {...props} />
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${alpha("#FFFDF9", 0.08)}`,
        }}
      >
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: alpha("#FFFDF9", 0.4),
            textAlign: "center",
          }}
        >
          Memory Lane v1.0
        </Typography>
      </Box>
    </Box>
  );
}

// Custom AppBar
function CustomAppBar(props: AppBarProps) {
  return (
    <AppBar
      {...props}
      sx={{
        bgcolor: colors.background.paper,
        color: colors.text.primary,
        boxShadow: "0 1px 4px rgba(139, 90, 43, 0.08)",
        "& .RaAppBar-title": {
          fontFamily: "'Merriweather', serif",
          fontWeight: 600,
          fontSize: "1.1rem",
          color: colors.primary.main,
        },
      }}
    >
      <Box sx={{ flex: 1 }} />
      <Tooltip title="Documentation">
        <IconButton
          sx={{ color: colors.text.secondary, "&:hover": { color: colors.primary.main } }}
          href="https://github.com"
          target="_blank"
        >
          <HelpOutlineIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="GitHub">
        <IconButton
          sx={{ color: colors.text.secondary, "&:hover": { color: colors.primary.main } }}
          href="https://github.com"
          target="_blank"
        >
          <GitHubIcon />
        </IconButton>
      </Tooltip>
    </AppBar>
  );
}

// Custom Sidebar with dark warm theme
function CustomSidebar(props: any) {
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));

  return (
    <Sidebar
      {...props}
      sx={{
        "& .RaSidebar-fixed": {
          background: "linear-gradient(180deg, #2C2420 0%, #1F1A17 100%)",
          width: isSmall ? 240 : 260,
        },
      }}
    >
      {props.children}
    </Sidebar>
  );
}

// Main Custom Layout
export function CustomLayout(props: LayoutProps) {
  return (
    <Layout
      {...props}
      appBar={CustomAppBar}
      sidebar={CustomSidebar}
      menu={CustomMenu}
      sx={{
        "& .RaLayout-content": {
          background: colors.background.default,
          minHeight: "100vh",
        },
      }}
    />
  );
}

export default CustomLayout;

