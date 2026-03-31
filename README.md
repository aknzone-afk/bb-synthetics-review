# Google Review QR Generator

Generate a branded Google review QR poster image from a review link.

This folder also contains a deploy-ready AI review assistant page.
The recommended setup uses a Netlify Function plus the OpenAI Responses API to generate a fresh review draft before opening Google.
It also includes an optional Supabase-backed fallback pool for non-repeat backup drafts.

## Quick Use

```powershell
python .\generate_google_review_qr.py --url "https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID" --business "My Business"
```

The output file is created at:

`D:\OneDrive\CODEX BB\google-review-qr\google-review-qr-poster.png`

## Notes

- Replace `YOUR_PLACE_ID` with your real Google review place ID or direct review link.
- You can also change the text with `--business`, `--tagline`, and `--out`.
- For the AI-powered flow, deploy on Netlify and add `OPENAI_API_KEY` in the site environment variables. Then point your QR to the hosted site URL.
- Use [DEPLOY.md](D:\OneDrive\CODEX BB\google-review-qr\DEPLOY.md) for hosting steps.
- For a shared 10,000-review non-repeat fallback pool across devices, follow [SUPABASE_SETUP.md](D:\OneDrive\CODEX BB\google-review-qr\SUPABASE_SETUP.md).
