import ReactDOM from "react-dom/client";
import "./css/styles.css";
import "./css/theme.css";
import { BrowserRouter } from "react-router";
import Router from "./routes/Router";
import { Provider } from "react-redux";
import { store } from "./redux/store";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <Provider store={store}>
  <BrowserRouter>
    <Router />
  </BrowserRouter>,
  </Provider>
);
