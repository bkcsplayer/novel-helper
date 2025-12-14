import { useEffect, useState } from "react";
import { Title, useNotify } from "react-admin";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  alpha,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import StorageIcon from "@mui/icons-material/Storage";
import FolderIcon from "@mui/icons-material/Folder";
import EmailIcon from "@mui/icons-material/Email";
import TelegramIcon from "@mui/icons-material/Telegram";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import GroupIcon from "@mui/icons-material/Group";
import ArticleIcon from "@mui/icons-material/Article";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { colors } from "../theme";

type Health = {
  ok: boolean;
  db?: { ok: boolean; latency_ms?: number; error?: string | null };
  storage?: { ok: boolean; audio_path?: string; book_path?: string; error?: string | null };
  smtp?: { configured: boolean; host?: string; port?: number };
  telegram?: { configured: boolean; ok?: boolean; error?: string };
  openrouter?: { configured: boolean; base_url?: string; model?: string; ok?: boolean; error?: string };
};

type Stats = {
  users: number;
  chapters: number;
  books: number;
};

function getApiBase(): string {
  const fromEnv = (import.meta.env.VITE_API_BASE as string | undefined) || "";
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const isPublic =
    window.location.port === "18080" ||
    window.location.port === "" ||
    window.location.port === "80" ||
    window.location.port === "443";
  return isPublic ? `${window.location.origin}/api` : `${window.location.protocol}//${window.location.hostname}:18888`;
}

function getAdminHeaders(): HeadersInit {
  const token = (import.meta.env.VITE_ADMIN_TOKEN as string | undefined) || "";
  return token ? { "X-Admin-Token": token } : {};
}

// Status indicator component
function StatusIndicator({ ok, label }: { ok?: boolean; label?: string }) {
  if (ok === undefined) {
    return (
      <Chip
        icon={<WarningIcon sx={{ fontSize: 16 }} />}
        label={label || "Unknown"}
        size="small"
        sx={{
          bgcolor: alpha(colors.accent.rust, 0.15),
          color: colors.accent.rust,
          fontWeight: 500,
          "& .MuiChip-icon": { color: colors.accent.rust },
        }}
      />
    );
  }
  return ok ? (
    <Chip
      icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
      label={label || "Connected"}
      size="small"
      sx={{
        bgcolor: alpha(colors.status.polished, 0.15),
        color: colors.status.polished,
        fontWeight: 500,
        "& .MuiChip-icon": { color: colors.status.polished },
      }}
    />
  ) : (
    <Chip
      icon={<ErrorIcon sx={{ fontSize: 16 }} />}
      label={label || "Error"}
      size="small"
      sx={{
        bgcolor: alpha(colors.status.error, 0.15),
        color: colors.status.error,
        fontWeight: 500,
        "& .MuiChip-icon": { color: colors.status.error },
      }}
    />
  );
}

// Service Card Component
function ServiceCard({
  title,
  icon,
  ok,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  ok?: boolean;
  children: React.ReactNode;
}) {
  const borderColor = ok === undefined ? colors.accent.rust : ok ? colors.status.polished : colors.status.error;

  return (
    <Card
      sx={{
        height: "100%",
        borderLeft: `4px solid ${borderColor}`,
        transition: "all 0.25s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 32px ${alpha(borderColor, 0.2)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: alpha(borderColor, 0.1),
                color: borderColor,
                display: "flex",
              }}
            >
              {icon}
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "'Merriweather', serif",
                fontWeight: 600,
                fontSize: "1rem",
                color: colors.text.primary,
              }}
            >
              {title}
            </Typography>
          </Box>
          <StatusIndicator ok={ok} />
        </Box>
        <Box sx={{ mt: 2 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

// Stats Card Component
function StatsCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card
      sx={{
        height: "100%",
        background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.03)} 100%)`,
        border: `1px solid ${alpha(color, 0.15)}`,
        transition: "all 0.25s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 32px ${alpha(color, 0.15)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: colors.text.secondary,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontSize: "0.75rem",
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "'Merriweather', serif",
                fontWeight: 700,
                color: color,
                mt: 0.5,
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: alpha(color, 0.12),
              color: color,
              display: "flex",
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// Info Row Component
function InfoRow({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.75, borderBottom: `1px solid ${alpha(colors.primary.main, 0.06)}` }}>
      <Typography variant="body2" sx={{ color: colors.text.secondary, fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: colors.text.primary,
          fontWeight: 500,
          maxWidth: "60%",
          textAlign: "right",
          wordBreak: "break-all",
        }}
      >
        {value ?? "—"}
      </Typography>
    </Box>
  );
}

export default function SystemStatus() {
  const [data, setData] = useState<Health | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const notify = useNotify();

  const loadData = async () => {
    try {
      setLoading(true);
      const apiBase = getApiBase();

      // Fetch health and stats in parallel
      const [healthRes, statsRes] = await Promise.all([
        fetch(`${apiBase}/admin/health`, { headers: getAdminHeaders() }),
        fetch(`${apiBase}/admin/stats`, { headers: getAdminHeaders() }),
      ]);

      if (healthRes.ok) {
        setData((await healthRes.json()) as Health);
      }
      if (statsRes.ok) {
        setStats((await statsRes.json()) as Stats);
      }
    } catch (e: any) {
      notify(e?.message || "Failed to load system status", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/admin/seed_demo`, {
        method: "POST",
        headers: { ...getAdminHeaders(), "Content-Type": "application/json" },
        body: "{}",
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      notify("Demo data seeded successfully! 🎉", { type: "success" });
      loadData();
    } catch (e: any) {
      notify(e?.message || "Seed demo failed", { type: "error" });
    } finally {
      setSeeding(false);
    }
  };

  const handleClearDemo = async () => {
    if (!window.confirm("Are you sure you want to delete all demo data?\n\nThis will remove the demo user and all related chapters and books.")) {
      return;
    }
    try {
      setClearing(true);
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/admin/clear_demo`, {
        method: "POST",
        headers: { ...getAdminHeaders(), "Content-Type": "application/json" },
        body: "{}",
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const result = await res.json();
      notify(`Demo data cleared! Deleted ${result.deleted_chapters} chapters, ${result.deleted_books} books. 🗑️`, { type: "success" });
      loadData();
    } catch (e: any) {
      notify(e?.message || "Clear demo failed", { type: "error" });
    } finally {
      setClearing(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
      <Title title="Dashboard" />

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Merriweather', serif",
              fontWeight: 700,
              color: colors.text.primary,
              mb: 0.5,
            }}
          >
            BioWeaver Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            System health and statistics overview
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Tooltip title="Refresh data">
            <IconButton
              onClick={loadData}
              disabled={loading}
              sx={{
                bgcolor: alpha(colors.primary.main, 0.08),
                "&:hover": { bgcolor: alpha(colors.primary.main, 0.15) },
              }}
            >
              <RefreshIcon sx={{ color: colors.primary.main }} />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            onClick={handleSeedDemo}
            disabled={seeding || clearing}
            startIcon={seeding ? <CircularProgress size={18} color="inherit" /> : <AutoStoriesIcon />}
            sx={{
              bgcolor: colors.secondary.main,
              "&:hover": { bgcolor: colors.secondary.dark },
              px: 3,
            }}
          >
            {seeding ? "Seeding..." : "Seed Demo Data"}
          </Button>
          <Button
            variant="outlined"
            onClick={handleClearDemo}
            disabled={clearing || seeding}
            startIcon={clearing ? <CircularProgress size={18} color="inherit" /> : <ErrorIcon />}
            sx={{
              borderColor: colors.status.error,
              color: colors.status.error,
              "&:hover": {
                borderColor: colors.status.error,
                bgcolor: alpha(colors.status.error, 0.08),
              },
              px: 3,
            }}
          >
            {clearing ? "Clearing..." : "Clear Demo Data"}
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: colors.primary.main }} />
        </Box>
      ) : (
        <>
          {/* Stats Cards */}
          {stats && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <StatsCard
                  title="Total Users"
                  value={stats.users}
                  icon={<GroupIcon sx={{ fontSize: 32 }} />}
                  color={colors.secondary.main}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatsCard
                  title="Chapters"
                  value={stats.chapters}
                  icon={<ArticleIcon sx={{ fontSize: 32 }} />}
                  color={colors.accent.gold}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatsCard
                  title="Books Generated"
                  value={stats.books}
                  icon={<MenuBookIcon sx={{ fontSize: 32 }} />}
                  color={colors.status.polished}
                />
              </Grid>
            </Grid>
          )}

          {/* Overall Status */}
          {data && (
            <Card
              sx={{
                mb: 4,
                background: data.ok
                  ? `linear-gradient(135deg, ${alpha(colors.status.polished, 0.08)} 0%, ${alpha(colors.status.polished, 0.02)} 100%)`
                  : `linear-gradient(135deg, ${alpha(colors.status.error, 0.08)} 0%, ${alpha(colors.status.error, 0.02)} 100%)`,
                border: `1px solid ${alpha(data.ok ? colors.status.polished : colors.status.error, 0.2)}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      bgcolor: data.ok ? colors.status.polished : colors.status.error,
                      boxShadow: `0 0 12px ${alpha(data.ok ? colors.status.polished : colors.status.error, 0.5)}`,
                      animation: data.ok ? "none" : "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: "'Merriweather', serif",
                      fontWeight: 600,
                      color: data.ok ? colors.status.polished : colors.status.error,
                    }}
                  >
                    {data.ok ? "All Systems Operational" : "System Issues Detected"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Service Cards Grid */}
          {data && (
            <Grid container spacing={3}>
              {/* Database */}
              <Grid item xs={12} md={6} lg={4}>
                <ServiceCard title="Database" icon={<StorageIcon />} ok={data.db?.ok}>
                  <InfoRow label="Status" value={data.db?.ok ? "Connected" : "Disconnected"} />
                  <InfoRow label="Latency" value={data.db?.latency_ms ? `${data.db.latency_ms} ms` : "—"} />
                  {data.db?.error && (
                    <Typography variant="body2" sx={{ color: colors.status.error, mt: 1, fontSize: "0.8rem" }}>
                      {data.db.error}
                    </Typography>
                  )}
                </ServiceCard>
              </Grid>

              {/* Storage */}
              <Grid item xs={12} md={6} lg={4}>
                <ServiceCard title="Storage" icon={<FolderIcon />} ok={data.storage?.ok}>
                  <InfoRow label="Audio Path" value={data.storage?.audio_path} />
                  <InfoRow label="Book Path" value={data.storage?.book_path} />
                  {data.storage?.error && (
                    <Typography variant="body2" sx={{ color: colors.status.error, mt: 1, fontSize: "0.8rem" }}>
                      {data.storage.error}
                    </Typography>
                  )}
                </ServiceCard>
              </Grid>

              {/* SMTP */}
              <Grid item xs={12} md={6} lg={4}>
                <ServiceCard title="Email (SMTP)" icon={<EmailIcon />} ok={data.smtp?.configured}>
                  <InfoRow label="Configured" value={data.smtp?.configured ? "Yes" : "No"} />
                  <InfoRow label="Host" value={data.smtp?.host} />
                  <InfoRow label="Port" value={data.smtp?.port} />
                </ServiceCard>
              </Grid>

              {/* Telegram */}
              <Grid item xs={12} md={6} lg={4}>
                <ServiceCard title="Telegram" icon={<TelegramIcon />} ok={data.telegram?.configured}>
                  <InfoRow label="Configured" value={data.telegram?.configured ? "Yes" : "No"} />
                  {data.telegram?.ok !== undefined && (
                    <InfoRow label="Connection" value={data.telegram.ok ? "OK" : "Failed"} />
                  )}
                  {data.telegram?.error && (
                    <Typography variant="body2" sx={{ color: colors.status.error, mt: 1, fontSize: "0.8rem" }}>
                      {data.telegram.error}
                    </Typography>
                  )}
                </ServiceCard>
              </Grid>

              {/* OpenRouter AI */}
              <Grid item xs={12} md={6} lg={4}>
                <ServiceCard title="AI Engine (OpenRouter)" icon={<SmartToyIcon />} ok={data.openrouter?.configured}>
                  <InfoRow label="Configured" value={data.openrouter?.configured ? "Yes" : "No"} />
                  <InfoRow label="Model" value={data.openrouter?.model?.split("/").pop()} />
                  {data.openrouter?.error && (
                    <Typography variant="body2" sx={{ color: colors.status.error, mt: 1, fontSize: "0.8rem" }}>
                      {data.openrouter.error}
                    </Typography>
                  )}
                </ServiceCard>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}
