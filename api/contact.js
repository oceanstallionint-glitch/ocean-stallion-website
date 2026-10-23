// Vercel serverless function: POST /api/contact
// Sends the website inquiry to your own Gmail through Gmail SMTP.
// Secrets live in Vercel Environment Variables, never in this file:
//   GMAIL_USER          e.g. oceanstallionint@gmail.com
//   GMAIL_APP_PASSWORD  16-character Google App Password
//   CONTACT_TO          (optional) where inquiries go; defaults to GMAIL_USER

const nodemailer = require('nodemailer');

const PRODUCTS = [
  'Yellow Maize',
  'White Maize',
  'Wheat',
  'Bajra',
  'Groundnut',
  'Other Grains'
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Best-effort rate limit (memory is per server instance, so this slows spam but is not absolute).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map();

function tooMany(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 1000) {
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

// Single-line fields: drop control characters and line breaks (blocks email header injection).
function line(value, max) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .trim()
    .slice(0, max);
}

// Multi-line field: keep new lines, drop other control characters.
function text(value, max) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .trim()
    .slice(0, max);
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch (e) {
    return false;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  if (!sameOrigin(req)) {
    return res.status(403).json({ ok: false, error: 'Forbidden' });
  }

  const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  if (tooMany(ip)) {
    return res.status(429).json({ ok: false, error: 'Too many requests. Please try again later.' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};

  // Honeypot: real visitors never fill this field. Pretend success so bots learn nothing.
  if (body.website) return res.status(200).json({ ok: true });

  const name = line(body.name, 100);
  const email = line(body.email, 150);
  const country = line(body.country, 80);
  const product = line(body.product, 40);
  const message = text(body.message, 2000);

  if (!name || !country || !EMAIL_RE.test(email) || PRODUCTS.indexOf(product) === -1) {
    return res.status(400).json({ ok: false, error: 'Please fill in all required fields correctly.' });
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.error('Missing GMAIL_USER or GMAIL_APP_PASSWORD environment variable');
    return res.status(500).json({ ok: false, error: 'Server is not configured.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass: pass.replace(/\s+/g, '') }
    });

    await transporter.sendMail({
      from: '"Ocean Stallion Website" <' + user + '>',
      to: process.env.CONTACT_TO || user,
      replyTo: email,
      subject: 'Website inquiry: ' + product + ' (' + country + ')',
      // Plain text only, so visitor input is never interpreted as HTML.
      text: [
        'New inquiry from the website',
        '',
        'Name: ' + name,
        'Email: ' + email,
        'Country: ' + country,
        'Product: ' + product,
        '',
        'Message:',
        message || '(none)'
      ].join('\n')
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('sendMail failed:', err && err.message);
    return res.status(502).json({ ok: false, error: 'Could not send your inquiry. Please email us directly.' });
  }
};
