import { visit } from 'unist-util-visit';

export default function remarkMediaEmbeds() {
  return (tree) => {
    visit(tree, 'paragraph', (node, index, parent) => {
      if (node.children.length === 1) {
        const child = node.children[0];
        let url = '';

        if (child.type === 'link') {
          url = child.url;
        } else if (child.type === 'text') {
          // Sometimes bare URLs are just text nodes if GFM autolink isn't catching it
          url = child.value.trim();
        }

        if (url) {
          const isYouTube = url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/);
          const isTikTok = url.match(/^(https?:\/\/)?(www\.)?tiktok\.com\/.+$/);

          if (isYouTube) {
            parent.children[index] = {
              type: 'mdxJsxFlowElement',
              name: 'YouTube',
              attributes: [
                {
                  type: 'mdxJsxAttribute',
                  name: 'url',
                  value: url,
                },
              ],
              children: [],
            };
          } else if (isTikTok) {
            parent.children[index] = {
              type: 'mdxJsxFlowElement',
              name: 'TikTok',
              attributes: [
                {
                  type: 'mdxJsxAttribute',
                  name: 'url',
                  value: url,
                },
              ],
              children: [],
            };
          }
        }
      }
    });
  };
}
