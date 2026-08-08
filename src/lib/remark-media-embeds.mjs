import { visit, SKIP } from "unist-util-visit";

const MATCHERS = [
  [/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/, "YouTube"],
  [/^(https?:\/\/)?(www\.)?tiktok\.com\/.+$/, "TikTok"],
];

const embedName = (url) => MATCHERS.find(([re]) => re.test(url))?.[1] ?? null;

/** The URL a node represents, if it is nothing but a URL. */
const urlOf = (node) =>
  node.type === "link"
    ? node.url
    : node.type === "text"
      ? node.value.trim()
      : "";

/**
 * Turns a YouTube or TikTok URL on its own line into a <YouTube>/<TikTok>
 * element, so posts can just paste a link.
 *
 * Handles both a URL in its own paragraph and a URL on the line directly
 * under a sentence — a soft break, which remark keeps in the same paragraph.
 *
 * Both components render a click-to-load facade, so an embed costs nothing
 * until the reader asks for it.
 */
export default function remarkMediaEmbeds() {
  return (tree) => {
    // `![alt](clip.mp4)` — ordinary markdown image syntax pointing at a video.
    // Saves posts from having to reach for a component.
    visit(tree, "image", (node, index, parent) => {
      if (!parent || index === undefined) return;
      if (!/\.(mp4|webm|mov)(\?.*)?$/i.test(node.url)) return;

      parent.children[index] = {
        type: "mdxJsxFlowElement",
        name: "Video",
        attributes: [
          { type: "mdxJsxAttribute", name: "src", value: node.url },
          { type: "mdxJsxAttribute", name: "caption", value: node.alt ?? "" },
        ],
        children: [],
      };
    });

    visit(tree, "paragraph", (node, index, parent) => {
      if (!parent || index === undefined) return;

      // Split the paragraph back into the lines the author typed. A hard break
      // is its own node, but a *soft* break is just a newline inside a text
      // node — which is the common case for a URL pasted under a sentence.
      const lines = [[]];
      for (const child of node.children) {
        if (child.type === "break") {
          lines.push([]);
        } else if (child.type === "text" && child.value.includes("\n")) {
          child.value.split("\n").forEach((part, i) => {
            if (i > 0) lines.push([]);
            if (part !== "") lines.at(-1).push({ ...child, value: part });
          });
        } else {
          lines.at(-1).push(child);
        }
      }

      // A line that is solely a media URL becomes an embed; the rest stays prose.
      const out = [];
      let changed = false;

      for (const line of lines) {
        // Ignore whitespace-only text when deciding if a line is just a URL.
        const solid = line.filter(
          (n) => !(n.type === "text" && n.value.trim() === ""),
        );
        const name = solid.length === 1 ? embedName(urlOf(solid[0])) : null;

        if (name) {
          out.push({
            type: "mdxJsxFlowElement",
            name,
            attributes: [
              { type: "mdxJsxAttribute", name: "url", value: urlOf(solid[0]) },
            ],
            children: [],
          });
          changed = true;
        } else if (solid.length) {
          const last = out.at(-1);
          // Keep consecutive prose lines in one paragraph, rejoined by the
          // newline that separated them.
          if (last?.type === "paragraph")
            last.children.push({ type: "text", value: "\n" }, ...line);
          else out.push({ type: "paragraph", children: line });
        }
      }

      if (!changed) return;

      parent.children.splice(index, 1, ...out);
      return [SKIP, index + out.length];
    });
  };
}
