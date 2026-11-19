import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Scene from "./DeskScene.jsx";

/** Called by the gate in Desk.astro once the element is near the viewport. */
export function mount(el) {
  const root = createRoot(el);
  root.render(
    <StrictMode>
      <Scene />
    </StrictMode>,
  );
  return () => root.unmount();
}
