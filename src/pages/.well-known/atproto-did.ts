import type { APIRoute } from "astro";

const DID = import.meta.env.ATPROTO_DID ?? "did:plc:3su63qgei4gylhflvwqj54lw";

export const GET: APIRoute = () =>
  new Response(DID, { headers: { "Content-Type": "text/plain" } });
