# Ocean Stallion International — Website

Static website (HTML + CSS + JS) with one small serverless function that emails contact-form inquiries to your own Gmail. Hosted on Vercel.

## Files

| File | Purpose |
|------|---------|
| `index.html` | All pages (Home, Products, Certificates, Gallery, Trade Progress, Contact) |
| `script.js` | Page routing, mobile menu, hero slider, loader, contact form |
| `api/contact.js` | Vercel function: validates the form and sends the email via Gmail |
| `package.json` | Declares the `nodemailer` dependency (Vercel installs it automatically) |
| `white-maize.jpg`, `bajra.jpg` | Product photos |

Keep the folder structure exactly as above (`api/contact.js` must stay inside the `api` folder).

## One-time email setup (Gmail App Password + Vercel)

1. Turn on 2-Step Verification for the Gmail account: https://myaccount.google.com/security
2. Create an App Password: https://myaccount.google.com/apppasswords (name it "Website"). Copy the 16-character password.
3. In Vercel: your project → Settings → Environment Variables. Add:
   - `GMAIL_USER` = `oceanstallionint@gmail.com`
   - `GMAIL_APP_PASSWORD` = the 16-character password
   - `CONTACT_TO` = (optional) a different inbox for inquiries
4. Vercel → Deployments → latest → Redeploy (environment variables only apply to new deployments).

Never put the App Password in any file or on GitHub. If it leaks, delete it in your Google account and create a new one.

## Run locally

Open `index.html` in a browser to preview the pages. The contact form needs the Vercel function, so test it on the deployed site (or with `npx vercel dev`).
