import { Outlet, createBrowserRouter, redirect } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage";
import Layout from "./Layout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import IsLoggedIn from "./loaders/IsLoggedIn";
import { CurrentUserProvider } from "../lib/contexts/CurrentUserContext";
import DashboardPage from "../pages/DashboardPage/DashboardPage";
import RepoPage from "../pages/RepoPage/RepoPage";
import NotificationPage from "../pages/NotificationPage/NotificationPage";
import SettingPage from "../pages/SettingPage/SettingPage";

const router = createBrowserRouter([
  {
    path: "",
    element: (
      <CurrentUserProvider>
        <Outlet />
      </CurrentUserProvider>
    ),
    children: [
      {
        path: "/auth",
        element: <Outlet />,
        children: [
          {
            path: "sign-in",
            element: <LoginPage />,
          },
          {
            path: "sign-up",
            element: <RegisterPage />,
          },
        ],
      },
      {
        path: "/",
        element: <Layout />,
        children: [
          {
            path: "",
            element: <HomePage />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "repos",
            element: <RepoPage />,
          },
          {
            path: "notifications",
            element: <NotificationPage />,
          },
          {
            path: "settings",
            element: <SettingPage />,
          },
        ],
      },
      {
        path: "/",
        loader: IsLoggedIn,
        element: <Outlet />,
        children: [
          {
            path: "profile",
            loader: () => {
              return redirect("/");
            },
          },
        ],
      },
    ],
  },
]);

export default router;
