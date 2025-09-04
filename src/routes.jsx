import PackageListPage from "./PackageList/Packages";
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
  },
  {
    path: "/packages",
    element: <PackageListPage />,
  }
];

export default routes;
