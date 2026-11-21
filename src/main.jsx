import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./lib/apiClient";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./store/auth.jsx";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { DialogHost, installDialogs } from "./components/ui/Dialogs.jsx";

// Browser alert() becomes a styled toast everywhere; confirm/prompt use confirmDialog/promptDialog
installDialogs();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DialogHost />
    <BrowserRouter>
      <HelmetProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HelmetProvider>
    </BrowserRouter>
  </StrictMode>,
);
