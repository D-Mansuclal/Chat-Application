import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/HomePage/HomePage";
import AccountActivated from "./components/auth/AccountActivated";
import "./App.css";

const App = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "auth/activate-account",
    element: <AccountActivated />
  }
]);

export default App;