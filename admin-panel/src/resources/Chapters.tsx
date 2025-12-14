import {
  Datagrid,
  Edit,
  EditButton,
  List,
  Show,
  ShowButton,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
  NumberField,
  NumberInput,
  SelectInput,
  useNotify,
  useRecordContext,
  TopToolbar,
  SaveButton,
  Toolbar,
  useRefresh,
  useRedirect,
  DateField,
  ExportButton,
} from "react-admin";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  alpha,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ArticleIcon from "@mui/icons-material/Article";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import MicIcon from "@mui/icons-material/Mic";
import { colors } from "../theme";
import { useState, useRef } from "react";

const statusChoices = [
  { id: "pending", name: "Pending" },
  { id: "polished", name: "Polished" },
];

// Status chip with color coding
function StatusChip() {
  const record = useRecordContext();
  if (!record) return null;

  const isPolished = record.status === "polished";
  return (
    <Chip
      icon={isPolished ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <PendingIcon sx={{ fontSize: 16 }} />}
      label={record.status}
      size="small"
      sx={{
        bgcolor: isPolished
          ? alpha(colors.status.polished, 0.12)
          : alpha(colors.status.pending, 0.12),
        color: isPolished ? colors.status.polished : colors.status.pending,
        fontWeight: 600,
        textTransform: "capitalize",
        "& .MuiChip-icon": {
          color: isPolished ? colors.status.polished : colors.status.pending,
        },
      }}
    />
  );
}

// Model field for list view - shows which AI model was used
function ModelField() {
  const record = useRecordContext();
  if (!record?.polished_by_model) {
    return (
      <Typography variant="body2" sx={{ color: colors.text.muted, fontStyle: "italic", fontSize: "0.75rem" }}>
        —
      </Typography>
    );
  }

  // Extract just the model name (e.g., "gpt-5.2" from "openai/gpt-5.2")
  const modelName = record.polished_by_model.split("/").pop() || record.polished_by_model;

  return (
    <Chip
      label={modelName}
      size="small"
      sx={{
        bgcolor: alpha(colors.accent.gold, 0.12),
        color: colors.accent.rust,
        fontWeight: 600,
        fontSize: "0.7rem",
        height: 22,
      }}
    />
  );
}

// Compact audio player for list view
function CompactAudioPlayer() {
  const record = useRecordContext();
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!record?.audio_url) {
    return (
      <Typography variant="body2" sx={{ color: colors.text.muted, fontStyle: "italic" }}>
        No audio
      </Typography>
    );
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <audio
        ref={audioRef}
        src={record.audio_url}
        preload="none"
        onEnded={() => setPlaying(false)}
        style={{ display: "none" }}
      />
      <IconButton
        onClick={togglePlay}
        size="small"
        sx={{
          bgcolor: alpha(colors.secondary.main, 0.1),
          color: colors.secondary.main,
          "&:hover": { bgcolor: alpha(colors.secondary.main, 0.2) },
        }}
      >
        {playing ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
      </IconButton>
      <Typography variant="caption" sx={{ color: colors.text.secondary }}>
        Audio
      </Typography>
    </Box>
  );
}

// Chapter title with segment indicator
function ChapterTitleField() {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Box>
      <Typography
        sx={{
          fontWeight: 600,
          color: colors.text.primary,
          fontSize: "0.9rem",
          lineHeight: 1.3,
        }}
      >
        {record.title}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: colors.text.secondary,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          mt: 0.5,
        }}
      >
        <MicIcon sx={{ fontSize: 12 }} />
        Segment {record.segment_index + 1}
      </Typography>
    </Box>
  );
}

// List Actions
function ChapterListActions() {
  return (
    <TopToolbar>
      <ExportButton />
    </TopToolbar>
  );
}

export function ChapterList() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Merriweather', serif",
            fontWeight: 700,
            color: colors.text.primary,
            mb: 0.5,
          }}
        >
          Chapters
        </Typography>
        <Typography variant="body2" sx={{ color: colors.text.secondary }}>
          Manage recorded memories and their AI-polished versions
        </Typography>
      </Box>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(139, 90, 43, 0.08)",
          border: `1px solid ${alpha(colors.primary.main, 0.08)}`,
        }}
      >
        <List
          actions={<ChapterListActions />}
          perPage={25}
          sx={{
            "& .RaList-main": { background: "transparent" },
          }}
        >
          <Datagrid
            rowClick="show"
            sx={{
              "& .RaDatagrid-headerCell": {
                bgcolor: alpha(colors.primary.main, 0.04),
                fontWeight: 600,
                color: colors.text.primary,
                borderBottom: `2px solid ${alpha(colors.primary.main, 0.1)}`,
              },
              "& .RaDatagrid-row": {
                "&:hover": {
                  bgcolor: alpha(colors.accent.gold, 0.05),
                },
              },
            }}
          >
            <NumberField source="id" label="ID" />
            <ChapterTitleField source="title" label="Chapter" />
            <TextField source="anchor_prompt" label="Anchor" />
            <StatusChip source="status" label="Status" />
            <ModelField source="polished_by_model" label="AI Model" />
            <CompactAudioPlayer source="audio_url" label="Audio" />
            <DateField source="created_at" label="Created" showTime />
            <ShowButton />
            <EditButton />
          </Datagrid>
        </List>
      </Card>
    </Box>
  );
}

// Full audio player for show/edit views
function FullAudioPlayer() {
  const record = useRecordContext();
  if (!record?.audio_url) {
    return (
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: alpha(colors.text.muted, 0.05),
          textAlign: "center",
        }}
      >
        <MicIcon sx={{ fontSize: 40, color: colors.text.muted, mb: 1 }} />
        <Typography sx={{ color: colors.text.muted }}>No audio recording</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${alpha(colors.secondary.main, 0.08)} 0%, ${alpha(colors.secondary.main, 0.03)} 100%)`,
        border: `1px solid ${alpha(colors.secondary.main, 0.15)}`,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          color: colors.secondary.main,
          fontWeight: 600,
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <MicIcon fontSize="small" />
        Audio Recording
      </Typography>
      <Box sx={{ 
        bgcolor: 'rgba(0,0,0,0.03)', 
        borderRadius: 2, 
        p: 1,
        '& audio': { width: '100%', outline: 'none' }
      }}>
        <audio 
          controls 
          preload="metadata"
          controlsList="nodownload"
        >
          <source src={record.audio_url} type="audio/webm" />
          <source src={record.audio_url} type="audio/mpeg" />
          <source src={record.audio_url} type="audio/wav" />
        </audio>
        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: colors.text.muted, fontSize: '0.7rem' }}>
          {record.audio_url?.split('/').pop()}
        </Typography>
      </Box>
    </Box>
  );
}

// Model badge component
function ModelBadge() {
  const record = useRecordContext();
  if (!record?.polished_by_model) return null;

  return (
    <Chip
      icon={<AutoFixHighIcon sx={{ fontSize: 14 }} />}
      label={record.polished_by_model}
      size="small"
      sx={{
        bgcolor: alpha(colors.accent.gold, 0.15),
        color: colors.accent.rust,
        fontWeight: 600,
        fontSize: "0.7rem",
        height: 24,
        "& .MuiChip-icon": { color: colors.accent.rust },
      }}
    />
  );
}

// Text preview component
function TextPreview({ source, label, isPolished }: { source: string; label: string; isPolished?: boolean }) {
  const record = useRecordContext();
  if (!record) return null;

  const text = record[source];
  const isEmpty = !text || text.trim() === "";

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: colors.text.secondary,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {isPolished ? <AutoFixHighIcon fontSize="small" /> : <ArticleIcon fontSize="small" />}
          {label}
        </Typography>
        {isPolished && <ModelBadge />}
      </Box>
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: isPolished
            ? `linear-gradient(135deg, ${alpha(colors.accent.gold, 0.08)} 0%, ${alpha(colors.accent.cream, 0.3)} 100%)`
            : alpha(colors.primary.main, 0.03),
          border: `1px solid ${alpha(isPolished ? colors.accent.gold : colors.primary.main, 0.12)}`,
          fontFamily: isPolished ? "'Merriweather', serif" : "'Inter', sans-serif",
          lineHeight: 1.8,
          whiteSpace: "pre-wrap",
          color: isEmpty ? colors.text.muted : colors.text.primary,
          fontStyle: isEmpty ? "italic" : "normal",
          minHeight: 100,
        }}
      >
        {isEmpty ? "No content yet..." : text}
      </Box>
    </Box>
  );
}

export function ChapterShow() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Show>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(139, 90, 43, 0.1)",
            border: `1px solid ${alpha(colors.primary.main, 0.08)}`,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${colors.accent.gold} 0%, ${colors.primary.main} 100%)`,
              p: 4,
            }}
          >
            <ChapterShowHeader />
          </Box>

          <CardContent sx={{ p: 4 }}>
            <SimpleShowLayout>
              {/* Meta info grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                  gap: 2,
                  mb: 4,
                }}
              >
                <MetaCard label="User ID" source="user_id" />
                <MetaCard label="Segment" source="segment_index" />
                <MetaCard label="Created" source="created_at" isDate />
              </Box>

              {/* Audio Player */}
              <Box sx={{ mb: 4 }}>
                <FullAudioPlayer />
              </Box>

              {/* Text Previews */}
              <TextPreview source="transcript_text" label="Original Transcript" />
              <TextPreview source="polished_text" label="AI-Polished Version" isPolished />
            </SimpleShowLayout>
          </CardContent>
        </Card>
      </Show>
    </Box>
  );
}

function ChapterShowHeader() {
  const record = useRecordContext();
  if (!record) return null;

  const isPolished = record.status === "polished";

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Chip
          label={record.status}
          sx={{
            bgcolor: isPolished ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
            color: "#fff",
            fontWeight: 600,
            textTransform: "capitalize",
          }}
        />
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontFamily: "'Merriweather', serif",
          fontWeight: 700,
          color: "#fff",
          mb: 1,
        }}
      >
        {record.title}
      </Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.8)" }}>
        Anchor: {record.anchor_prompt || "None"}
      </Typography>
    </Box>
  );
}

function MetaCard({ label, source, isDate }: { label: string; source: string; isDate?: boolean }) {
  const record = useRecordContext();
  if (!record) return null;

  let value = record[source];
  if (isDate && value) {
    value = new Date(value).toLocaleString();
  }

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: alpha(colors.primary.main, 0.03),
        border: `1px solid ${alpha(colors.primary.main, 0.08)}`,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: colors.text.secondary,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontWeight: 500,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600, color: colors.text.primary, mt: 0.5 }}>
        {value ?? "—"}
      </Typography>
    </Box>
  );
}

// Custom toolbar with re-polish button
function ChapterEditToolbar() {
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();
  const record = useRecordContext();

  const repolish = async () => {
    try {
      if (!record?.id) return;
      const apiBase = (import.meta.env.VITE_API_BASE as string | undefined) || "";
      const isPublic =
        window.location.port === "18080" ||
        window.location.port === "" ||
        window.location.port === "80" ||
        window.location.port === "443";
      const base = apiBase
        ? apiBase.replace(/\/$/, "")
        : isPublic
          ? `${window.location.origin}/api`
          : `${window.location.protocol}//${window.location.hostname}:18888`;
      const headers: HeadersInit = { "Content-Type": "application/json" };
      const token = (import.meta.env.VITE_ADMIN_TOKEN as string | undefined) || "";
      if (token) (headers as any)["X-Admin-Token"] = token;
      const res = await fetch(`${base}/chapters/${record.id}/polish`, { method: "POST", headers, body: "{}" });
      if (!res.ok) throw new Error(`Re-polish failed: ${res.status}`);
      notify("AI re-polish triggered! ✨", { type: "success" });
      refresh();
    } catch (e: any) {
      notify(e?.message || "Re-polish failed", { type: "error" });
    }
  };

  return (
    <Toolbar sx={{ display: "flex", gap: 2, justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", gap: 2 }}>
        <SaveButton />
        <Button
          variant="outlined"
          onClick={() => redirect("show", "chapters", record?.id)}
          sx={{
            borderColor: colors.primary.main,
            color: colors.primary.main,
            "&:hover": { bgcolor: alpha(colors.primary.main, 0.05) },
          }}
        >
          View
        </Button>
      </Box>
      <Tooltip title="Re-run AI polishing on the transcript">
        <Button
          variant="contained"
          onClick={repolish}
          startIcon={<AutoFixHighIcon />}
          sx={{
            bgcolor: colors.accent.gold,
            color: "#fff",
            "&:hover": { bgcolor: colors.accent.rust },
          }}
        >
          Re-polish with AI
        </Button>
      </Tooltip>
    </Toolbar>
  );
}

export function ChapterEdit() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(139, 90, 43, 0.1)",
          border: `1px solid ${alpha(colors.primary.main, 0.08)}`,
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${colors.accent.gold} 0%, ${colors.primary.main} 100%)`,
              p: 3,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: "'Merriweather', serif",
                fontWeight: 600,
                color: "#fff",
              }}
            >
              Edit Chapter
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Edit>
              <SimpleForm toolbar={<ChapterEditToolbar />}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                  <TextInput source="title" fullWidth />
                  <TextInput source="anchor_prompt" fullWidth />
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
                  <SelectInput source="status" choices={statusChoices} fullWidth />
                  <NumberInput source="user_id" fullWidth />
                  <NumberInput source="segment_index" fullWidth />
                </Box>
                <TextInput source="audio_url" fullWidth disabled />
                
                <Typography
                  variant="subtitle2"
                  sx={{ mt: 3, mb: 1, color: colors.text.secondary, fontWeight: 600 }}
                >
                  Transcript (Original Recording)
                </Typography>
                <TextInput source="transcript_text" multiline minRows={6} fullWidth />
                
                <Typography
                  variant="subtitle2"
                  sx={{ mt: 3, mb: 1, color: colors.accent.gold, fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <AutoFixHighIcon fontSize="small" />
                  Polished Text (AI-Generated)
                </Typography>
                <TextInput
                  source="polished_text"
                  multiline
                  minRows={8}
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      fontFamily: "'Merriweather', serif",
                      lineHeight: 1.8,
                    },
                  }}
                />
              </SimpleForm>
            </Edit>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
