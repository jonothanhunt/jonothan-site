import atprotoTids from '@/data/atproto-tids.json';

export async function GET() {
  const atprotoDid = process.env.ATPROTO_DID || 'did:plc:3su63qgei4gylhflvwqj54lw';
  const uri = `at://${atprotoDid}/site.standard.publication/${atprotoTids.__publication__}`;

  return new Response(uri, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
