# Deploy This AI Review Assistant

This folder is now ready for Netlify hosting with a serverless AI endpoint.

## Main file

Use:

`D:\OneDrive\CODEX BB\google-review-qr\index.html`

## Recommended host: Netlify

1. Create a new site on Netlify.
2. Drag and drop the full folder:
   `D:\OneDrive\CODEX BB\google-review-qr`
3. In `Site configuration > Environment variables`, add:
   `OPENAI_API_KEY = your OpenAI API key`
4. Optional:
   `OPENAI_MODEL = gpt-5.4-mini`
5. Redeploy the site after saving environment variables.
6. Your site URL will look like:
   `https://your-site-name.netlify.app/`

## Important note

GitHub Pages can host the HTML and CSS, but it cannot run the AI review generator because that requires a secure server-side function for the OpenAI API key.
If you want the true AI-powered flow, use Netlify.

## After deployment

Once you have the public site URL, generate a new QR that points to that URL instead of directly to Google.

Example:

```powershell
python .\generate_google_review_qr.py --url "https://your-site-name.netlify.app/" --business "B.B. Synthetics" --tagline "Scan to open a ready-made Google review draft."
```
