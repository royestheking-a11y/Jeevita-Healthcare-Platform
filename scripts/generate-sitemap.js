const fs = require('fs');
const path = require('path');

const baseUrl = 'https://jeevita.vercel.app';

const staticPages = [
    '/',
    '/doctors',
    '/hospitals',
    '/medicines',
    '/login',
    '/signup',
    '/about',
    '/contact',
    '/privacy',
    '/terms'
];

// In a real app, you would fetch these from your API or database
// For now, we'll use some placeholders or try to read from a local data file if possible
// Since we don't have direct DB access here, we'll just list a few examples
const doctors = [
    { id: '1', updated: '2025-11-01' },
    { id: '2', updated: '2025-11-01' },
    { id: '3', updated: '2025-11-01' }
];

const hospitals = [
    { id: '1', updated: '2025-09-15' },
    { id: '2', updated: '2025-09-15' }
];

const medicines = [
    { id: '1', updated: '2025-10-20' },
    { id: '2', updated: '2025-10-20' }
];

function buildUrl(loc, lastmod = null, changefreq = 'weekly', priority = '0.8') {
    return `
  <url>
    <loc>${baseUrl}${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

staticPages.forEach(p => {
    xml += buildUrl(p, new Date().toISOString().split('T')[0], 'daily', '1.0');
});

doctors.forEach(d => {
    xml += buildUrl(`/doctor-profile/${d.id}`, d.updated || null, 'monthly', '0.9');
});

hospitals.forEach(h => {
    xml += buildUrl(`/hospital-details/${h.id}`, h.updated || null, 'monthly', '0.9');
});

medicines.forEach(m => {
    xml += buildUrl(`/medicine-details/${m.id}`, m.updated || null, 'monthly', '0.9');
});

xml += '\n</urlset>';

const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf8');
console.log('sitemap created at', outPath);
