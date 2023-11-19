import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/HomePage/HomePage";
import "./App.css";

const App = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  }
]);

export default App;