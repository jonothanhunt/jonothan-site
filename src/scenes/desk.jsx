import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Scene from "./DeskScene.jsx";

/** Called by the gate in Desk.astro once a capable device is ready for it. */
export function mount(el) {
  const root = createRoot(el);
  root.render(
    <StrictMode>
      <Scene onReady={() => el.classList.add("is-ready")} />
    </StrictMode>,
  );
  return () => root.unmount();
}
