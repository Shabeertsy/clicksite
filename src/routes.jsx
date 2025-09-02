import Home from "./pages/Home/Home";
import LoginForm from "./pages/login/Login";

const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <LoginForm />,
  }
];

export default routes;
