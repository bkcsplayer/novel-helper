import {
  Datagrid,
  Edit,
  EditButton,
  List,
  NumberField,
  Show,
  ShowButton,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
  DateField,
  useRecordContext,
  TopToolbar,
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
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DownloadIcon from "@mui/icons-material/Download";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import { colors } from "../theme";

// Book title with icon
function BookTitleField() {
  const record = useRecordContext();
  if (!record) return null;

  return (
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
          boxShadow: `0 2px 8px ${alpha(colors.accent.gold, 0.3)}`,
        }}
      >
        <MenuBookIcon sx={{ color: "#fff", fontSize: 20 }} />
      </Box>
      <Box>
        <Typography
          sx={{
            fontFamily: "'Merriweather', serif",
            fontWeight: 600,
            color: colors.text.primary,
            fontSize: "0.95rem",
          }}
        >
          {record.title}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: colors.text.secondary,
          }}
        >
          Book #{record.id}
        </Typography>
      </Box>
    </Box>
  );
}

// Download button
function DownloadButton() {
  const record = useRecordContext();
  if (!record?.pdf_url) {
    return (
      <Chip
        label="No file"
        size="small"
        sx={{
          bgcolor: alpha(colors.text.muted, 0.1),
          color: colors.text.muted,
        }}
      />
    );
  }

  return (
    <Button
      size="small"
      variant="outlined"
      href={record.pdf_url}
      target="_blank"
      startIcon={<DownloadIcon />}
      sx={{
        borderColor: colors.secondary.main,
        color: colors.secondary.main,
        fontWeight: 500,
        "&:hover": {
          bgcolor: alpha(colors.secondary.main, 0.05),
          borderColor: colors.secondary.dark,
        },
      }}
    >
      Download
    </Button>
  );
}

// List Actions
function BookListActions() {
  return (
    <TopToolbar>
      <ExportButton />
    </TopToolbar>
  );
}

export function BookList() {
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
          Books
        </Typography>
        <Typography variant="body2" sx={{ color: colors.text.secondary }}>
          View and manage generated biography books
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
          actions={<BookListActions />}
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
            <BookTitleField source="title" label="Book" />
            <NumberField source="user_id" label="User ID" />
            <DateField source="created_at" label="Created" showTime />
            <DownloadButton source="pdf_url" label="File" />
            <ShowButton />
            <EditButton />
          </Datagrid>
        </List>
      </Card>
    </Box>
  );
}

export function BookShow() {
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
          {/* Header with gradient */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${colors.status.polished} 0%, ${colors.secondary.dark} 100%)`,
              p: 4,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative book pattern */}
            <Box
              sx={{
                position: "absolute",
                right: -20,
                top: -20,
                opacity: 0.1,
              }}
            >
              <MenuBookIcon sx={{ fontSize: 200, color: "#fff" }} />
            </Box>
            <BookShowHeader />
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
                <MetaCard icon={<PersonIcon />} label="User ID" source="user_id" />
                <MetaCard icon={<CalendarTodayIcon />} label="Created" source="created_at" isDate />
                <DownloadCard />
              </Box>

              {/* Description */}
              <DescriptionSection />
            </SimpleShowLayout>
          </CardContent>
        </Card>
      </Show>
    </Box>
  );
}

function BookShowHeader() {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Box sx={{ position: "relative", zIndex: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MenuBookIcon sx={{ fontSize: 32, color: "#fff" }} />
        </Box>
        <Box>
          <Chip
            label="Published"
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "#fff",
              fontWeight: 600,
              mb: 1,
            }}
          />
        </Box>
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
    </Box>
  );
}

function MetaCard({
  icon,
  label,
  source,
  isDate,
}: {
  icon: React.ReactNode;
  label: string;
  source: string;
  isDate?: boolean;
}) {
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
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: alpha(colors.primary.main, 0.08),
          color: colors.primary.main,
          display: "flex",
        }}
      >
        {icon}
      </Box>
      <Box>
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
        <Typography sx={{ fontWeight: 600, color: colors.text.primary, mt: 0.25 }}>
          {value ?? "—"}
        </Typography>
      </Box>
    </Box>
  );
}

function DownloadCard() {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${alpha(colors.secondary.main, 0.08)} 0%, ${alpha(colors.secondary.main, 0.03)} 100%)`,
        border: `1px solid ${alpha(colors.secondary.main, 0.15)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha(colors.secondary.main, 0.15),
            color: colors.secondary.main,
            display: "flex",
          }}
        >
          <DescriptionIcon />
        </Box>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: colors.text.secondary,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 500,
            }}
          >
            Book File
          </Typography>
          <Typography sx={{ fontWeight: 600, color: colors.text.primary, mt: 0.25 }}>
            {record.pdf_url ? "Available" : "Not generated"}
          </Typography>
        </Box>
      </Box>
      {record.pdf_url && (
        <Button
          variant="contained"
          href={record.pdf_url}
          target="_blank"
          startIcon={<DownloadIcon />}
          sx={{
            bgcolor: colors.secondary.main,
            "&:hover": { bgcolor: colors.secondary.dark },
          }}
        >
          Download
        </Button>
      )}
    </Box>
  );
}

function DescriptionSection() {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{
          color: colors.text.secondary,
          fontWeight: 600,
          mb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <DescriptionIcon fontSize="small" />
        Description
      </Typography>
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: alpha(colors.primary.main, 0.03),
          border: `1px solid ${alpha(colors.primary.main, 0.08)}`,
          fontFamily: "'Merriweather', serif",
          lineHeight: 1.8,
          color: record.description ? colors.text.primary : colors.text.muted,
          fontStyle: record.description ? "normal" : "italic",
          minHeight: 80,
        }}
      >
        {record.description || "No description provided..."}
      </Box>
    </Box>
  );
}

export function BookEdit() {
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
              background: `linear-gradient(135deg, ${colors.status.polished} 0%, ${colors.secondary.dark} 100%)`,
              p: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <MenuBookIcon sx={{ fontSize: 32, color: "#fff" }} />
            <Typography
              variant="h5"
              sx={{
                fontFamily: "'Merriweather', serif",
                fontWeight: 600,
                color: "#fff",
              }}
            >
              Edit Book
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Edit>
              <SimpleForm>
                <TextInput
                  source="title"
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextInput
                  source="description"
                  fullWidth
                  multiline
                  minRows={4}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: 2,
                      fontFamily: "'Merriweather', serif",
                    },
                  }}
                />
                <TextInput
                  source="pdf_url"
                  fullWidth
                  disabled
                  helperText="File URL is automatically generated"
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: 2,
                      bgcolor: alpha(colors.text.muted, 0.05),
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
