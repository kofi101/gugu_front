import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/archivo/wdth.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { App } from "./App";

// index.html carries fallback SEO tags for crawlers that don't run JavaScript.
// Per-route tags are rendered by <Seo>, so drop the fallbacks to avoid duplicates.
document.querySelectorAll("[data-static-seo]").forEach((el) => el.remove());

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
