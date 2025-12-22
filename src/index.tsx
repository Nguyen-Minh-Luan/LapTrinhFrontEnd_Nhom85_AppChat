import ReactDOM from "react-dom/client";
import "./css/styles.css";
import "./css/theme.css";
import { RouterProvider } from "react-router";
import { router } from "./router.ts";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(<RouterProvider router={router} />);
