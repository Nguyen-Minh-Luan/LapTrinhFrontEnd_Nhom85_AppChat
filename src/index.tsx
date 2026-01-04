import ReactDOM from "react-dom/client";
import "./css/styles.css";
import "./css/theme.css";
import { BrowserRouter } from "react-router";
import Router from "./routes/Router";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <BrowserRouter>
    <Router />
  </BrowserRouter>,
);
