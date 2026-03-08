import { createBrowserRouter, redirect } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./pages/Home";
import { EventDetail } from "./pages/EventDetail";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";

import { Profile } from "./pages/Profile";
import { Admin } from "./pages/Admin";
import { Community } from "./pages/Community";
import ResetPassword from "./pages/ResetPassword";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "event/:id", Component: EventDetail },
      { path: "login", Component: Login },
      { path: "signup", Component: SignUp },
      { path: "profile", Component: Profile },
      { path: "admin", loader: () => redirect('/spiddy') },
      { path: "spiddy", Component: Admin },
      { path: "community", Component: Community },
      { path: "reset-password", Component: ResetPassword },
    ],
  },
]);