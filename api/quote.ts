// Placeholder serverless function entry; implement scraping in future milestone.
export default async function handler(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get('isbn');

  if (!isbn) {
    return new Response(JSON.stringify({ error: 'isbn is required' }), { status: 400 });
  }

  const mock = {
    isbn,
    title: 'Sample Title',
    aladin: { is_buyable: false, price: 0 },
    yes24: { is_buyable: false, price: 0 },
    recommendation: 'none',
  };

  return new Response(JSON.stringify(mock), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
