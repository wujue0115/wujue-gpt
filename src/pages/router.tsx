import { createBrowserRouter } from "react-router-dom";
import { RouteType } from "../types/route.types";
import Root from "./Root";
import Chat from "./Chat";

const routes: RouteType[] = [
  {
    path: "/",
    element: <Root />,
  },
  {
    path: "/chat",
    element: <Chat />,
  }
];

const router = createBrowserRouter(routes);

export default router;