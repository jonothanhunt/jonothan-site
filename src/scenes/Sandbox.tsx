import { Sandpack } from "@codesandbox/sandpack-react";

interface Props {
  files: Record<string, { code: string; hidden?: boolean }>;
  height: number;
  view: "preview" | "split";
}

/** Real Sandpack, mounted only once the block is scrolled to. */
export default function Sandbox({ files, height, view }: Props) {
  return (
    <Sandpack
      template="static"
      files={files}
      theme={{
        colors: {
          surface1: "#fffdf8",
          surface2: "#f6f1e8",
          surface3: "#efe8dc",
          accent: "#6d4aff",
        },
        font: {
          body: "Hyperlegible, system-ui, sans-serif",
          mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
          size: "13px",
        },
      }}
      options={{
        showLineNumbers: true,
        showTabs: true,
        editorHeight: height,
        editorWidthPercentage: view === "preview" ? 0 : 50,
        resizablePanels: true,
      }}
    />
  );
}
