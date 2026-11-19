import type { APIRoute } from "astro";
import tids from "../../data/atproto-tids.json";

const DID = import.meta.env.ATPROTO_DID ?? "did:plc:3su63qgei4gylhflvwqj54lw";

export const GET: APIRoute = () =>
  new Response(`at://${DID}/site.standard.publication/${tids.__publication__}`, {
    headers: {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*",
    },
  });
