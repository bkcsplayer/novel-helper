import { Admin, Resource } from "react-admin";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GroupIcon from "@mui/icons-material/Group";
import ArticleIcon from "@mui/icons-material/Article";
import MenuBookIcon from "@mui/icons-material/MenuBook";

import { dataProvider } from "./dataProvider";
import SystemStatus from "./pages/SystemStatus";
import { CustomLayout } from "./components/Layout";
import { theme } from "./theme";
import { BookEdit, BookList, BookShow } from "./resources/Books";
import { ChapterEdit, ChapterList, ChapterShow } from "./resources/Chapters";
import { UserCreate, UserEdit, UserList, UserShow } from "./resources/Users";

export default function AdminApp() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Admin
        dataProvider={dataProvider}
        dashboard={SystemStatus}
        layout={CustomLayout}
        disableTelemetry
      >
        <Resource
          name="users"
          list={UserList}
          show={UserShow}
          edit={UserEdit}
          create={UserCreate}
          icon={GroupIcon}
          options={{ label: "Users" }}
        />
        <Resource
          name="chapters"
          list={ChapterList}
          show={ChapterShow}
          edit={ChapterEdit}
          icon={ArticleIcon}
          options={{ label: "Chapters" }}
        />
        <Resource
          name="books"
          list={BookList}
          show={BookShow}
          edit={BookEdit}
          icon={MenuBookIcon}
          options={{ label: "Books" }}
        />
      </Admin>
    </ThemeProvider>
  );
}
