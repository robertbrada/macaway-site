import type { APIRoute } from 'astro';

// Hand-written rather than generated, because the list is four pages long and one of them
// must stay out: /thanks shows a buyer's licence key and is noindex.
// The trailing slashes match what each page gives as its canonical, so the two agree.
const pages = ['', 'privacy/', 'lost-key/'];

export const GET: APIRoute = ({ site }) => {
  const urls = pages
    .map((page) => `  <url><loc>${new URL(page, site)}</loc></url>`)
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
    { headers: { 'content-type': 'application/xml; charset=utf-8' } },
  );
};
