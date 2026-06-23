"use client";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import { useEffect, useState } from "react";
import type { SandpackPredefinedTemplate } from "@codesandbox/sandpack-react";

// SandpackEmbed: fetches files from public and passes them to Sandpack
export type SandpackEmbedFile = { file: string; visible?: boolean } | string;
export type SandpackEmbedProps = {
  basePath: string;
  files: SandpackEmbedFile[];
  template?: SandpackPredefinedTemplate;
  view?: "both" | "code" | "preview";
};

export function SandpackEmbed({ basePath, files, template = "static", view = "both" }: SandpackEmbedProps) {
  // Support both string[] and {file, visible}[] for backward compatibility
  const fileList = files.map(f => typeof f === "string" ? { file: f, visible: true } : { file: f.file, visible: f.visible !== false });
  const [fileContents, setFileContents] = useState<Record<string, { code: string }>>({});
  useEffect(() => {
    let isMounted = true;

    // Re-derive fileList inside effect to avoid dependency warnings/instability
    const currentFileList = files.map(f => typeof f === "string" ? { file: f, visible: true } : { file: f.file, visible: f.visible !== false });

    Promise.all(
      currentFileList.map(async ({ file }) => {
        const res = await fetch(`${basePath}${file}`);
        const code = await res.text();
        return ["/" + file, { code }];
      })
    ).then((entries) => {
      if (isMounted) setFileContents(Object.fromEntries(entries));
    });
    return () => {
      isMounted = false;
    };
  }, [basePath, files]);
  if (Object.keys(fileContents).length !== fileList.length) {
    return <div>Loading code demo…</div>;
  }
  // Editor and preview settings
  const editorHeight = 400;
  // Only show files where visible !== false
  const visibleFiles = fileList.filter(f => f.visible).map(f => "/" + f.file);
  return (
    <div
      style={{
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
        marginTop: "1rem",
        marginBottom: "2rem",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "min(1200px, 95vw)", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
        <SandpackProvider
          template={template}
          theme="auto"
          files={fileContents}
          options={{
            visibleFiles,
          }}
        >
          {view === "both" ? (
            <SandpackLayout>
              <SandpackCodeEditor
                showTabs
                showLineNumbers
                wrapContent
                style={{ height: editorHeight, minWidth: 0 }}
              />
              <SandpackPreview style={{ height: editorHeight, minWidth: 0 }} />
            </SandpackLayout>
          ) : view === "code" ? (
            <SandpackCodeEditor
              showTabs
              showLineNumbers
              wrapContent
              style={{ height: editorHeight, minWidth: 0 }}
            />
          ) : (
            <SandpackPreview style={{ height: editorHeight, minWidth: 0 }} />
          )}
        </SandpackProvider>
      </div>
    </div>
  );
}
