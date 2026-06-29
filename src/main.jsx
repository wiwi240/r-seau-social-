import React from "react";
import ReactDOM from "react-dom/client";
import { Provider, createStore } from "jotai";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import {
  markPwaInstalledAtom,
  registerInstallPromptEventAtom,
  syncPwaInstalledAtom,
} from "./state/socialAtoms";
import "./styles.css";

const store = createStore();

if (typeof window !== "undefined") {
  const isStandalone =
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true;

  store.set(syncPwaInstalledAtom, isStandalone);

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    store.set(registerInstallPromptEventAtom, event);
  });

  window.addEventListener("appinstalled", () => {
    store.set(markPwaInstalledAtom);
  });

  if ("serviceWorker" in navigator && import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js");
    });
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
