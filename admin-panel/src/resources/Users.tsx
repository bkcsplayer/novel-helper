import {
  Create,
  Datagrid,
  Edit,
  EditButton,
  List,
  SimpleForm,
  TextField,
  TextInput,
  Show,
  SimpleShowLayout,
  ShowButton,
  DateField,
  TopToolbar,
  CreateButton,
  ExportButton,
  useRecordContext,
} from "react-admin";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  alpha,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { colors } from "../theme";

// Custom list actions
function UserListActions() {
  return (
    <TopToolbar>
      <CreateButton
        sx={{
          bgcolor: colors.secondary.main,
          color: "#fff",
          "&:hover": { bgcolor: colors.secondary.dark },
        }}
      />
      <ExportButton />
    </TopToolbar>
  );
}

// User avatar generator based on name
function UserAvatar() {
  const record = useRecordContext();
  if (!record) return null;
  
  const name = record.name || "User";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  
  // Generate consistent color based on user id
  const hue = (record.id * 137.5) % 360;
  const bgcolor = `hsl(${hue}, 45%, 55%)`;

  return (
    <Avatar
      sx={{
        width: 36,
        height: 36,
        bgcolor,
        fontSize: "0.85rem",
        fontWeight: 600,
        boxShadow: `0 2px 8px ${alpha(bgcolor, 0.4)}`,
      }}
    >
      {initials}
    </Avatar>
  );
}

// Custom user row
function UserNameField() {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <UserAvatar />
      <Box>
        <Typography
          sx={{
            fontWeight: 600,
            color: colors.text.primary,
            fontSize: "0.9rem",
          }}
        >
          {record.name}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: colors.text.secondary,
          }}
        >
          ID: {record.id}
        </Typography>
      </Box>
    </Box>
  );
}

export function UserList() {
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
          Users
        </Typography>
        <Typography variant="body2" sx={{ color: colors.text.secondary }}>
          Manage registered users and their profiles
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
          actions={<UserListActions />}
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
            <UserNameField source="name" label="User" />
            <TextField source="email" />
            <DateField source="created_at" label="Joined" showTime />
            <ShowButton />
            <EditButton />
          </Datagrid>
        </List>
      </Card>
    </Box>
  );
}

export function UserShow() {
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
              background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
              p: 4,
              pb: 6,
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
              User Profile
            </Typography>
          </Box>

          {/* Avatar overlapping */}
          <Box sx={{ px: 4, mt: -4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: colors.accent.gold,
                fontSize: "2rem",
                fontWeight: 700,
                border: "4px solid #fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
          </Box>

          <CardContent sx={{ pt: 2, pb: 4, px: 4 }}>
            <SimpleShowLayout>
              <Box sx={{ display: "grid", gap: 3 }}>
                <InfoCard
                  icon={<PersonIcon />}
                  label="Name"
                  source="name"
                />
                <InfoCard
                  icon={<EmailIcon />}
                  label="Email"
                  source="email"
                />
                <InfoCard
                  icon={<CalendarTodayIcon />}
                  label="Joined"
                  source="created_at"
                  isDate
                />
              </Box>
            </SimpleShowLayout>
          </CardContent>
        </Card>
      </Show>
    </Box>
  );
}

// Info card for show view
function InfoCard({
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
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: alpha(colors.primary.main, 0.03),
        border: `1px solid ${alpha(colors.primary.main, 0.08)}`,
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
        <Typography
          sx={{
            fontWeight: 500,
            color: colors.text.primary,
          }}
        >
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

export function UserEdit() {
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
              background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
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
              Edit User
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Edit>
              <SimpleForm>
                <TextInput
                  source="name"
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextInput
                  source="email"
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: 2,
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

export function UserCreate() {
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
              background: `linear-gradient(135deg, ${colors.secondary.main} 0%, ${colors.secondary.dark} 100%)`,
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
              Create New User
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Create>
              <SimpleForm>
                <TextInput
                  source="name"
                  fullWidth
                  required
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextInput
                  source="email"
                  fullWidth
                  required
                  type="email"
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </SimpleForm>
            </Create>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
