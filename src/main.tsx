import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "@/context/AuthContext";
import App from "./App";
import "mapbox-gl/dist/mapbox-gl.css";
import "./styles/index.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
