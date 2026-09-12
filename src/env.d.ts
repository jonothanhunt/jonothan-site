declare namespace App {
  interface Locals {
    /**
     * Absolute URL of the post currently being rendered.
     *
     * Set only by the feed's container render (src/lib/rss-content.ts), which
     * is the one context where a component has to link back at the article it
     * came from. Undefined during a normal page build.
     */
    postUrl?: string;
  }
}
