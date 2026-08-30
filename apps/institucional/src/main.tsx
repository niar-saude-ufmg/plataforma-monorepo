import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RemoteApp from "./RemoteApp";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><BrowserRouter><RemoteApp /></BrowserRouter></React.StrictMode>
);
