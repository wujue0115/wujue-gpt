import { createBrowserRouter } from "react-router-dom";
import { RouterType } from "../types/router.types";
import Root from "./Root";
import Chat from "./Chat";

const routes: RouterType[] = [
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