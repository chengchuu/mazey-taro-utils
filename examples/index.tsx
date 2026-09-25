import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import {
  getEnv,
  getWindowSize,
  isH5,
  isMiniProgram,
  quickNavigateTo,
  quickRedirectTo,
  quickScrollTo,
  quickToast,
} from "../src";
import { App } from "./App";
import "./styles.css";

const root = document.getElementById("playground-root");

if (!root) throw new Error("Missing playground root");

createRoot(root).render(
  <StrictMode>
    <App
      api={{
        getEnv,
        getWindowSize,
        isH5,
        isMiniProgram,
        quickNavigateTo,
        quickRedirectTo,
        quickScrollTo,
        quickToast,
      }}
    />
  </StrictMode>,
);
