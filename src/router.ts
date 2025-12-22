import { createBrowserRouter } from "react-router";
import { MainApp } from "./page/MainApp.tsx";

export const router = createBrowserRouter([
  { path: "/home", Component: MainApp },
]);
