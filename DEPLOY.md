# Deploy This Review Assistant

This folder is now ready for static hosting on GitHub Pages or Netlify.

## Main file

Use:

`C:\Users\4001C\Desktop\CODEX\google-review-qr\index.html`

## GitHub Pages

1. Create a new GitHub repository.
2. Upload everything from:
   `C:\Users\4001C\Desktop\CODEX\google-review-qr`
3. In GitHub, open `Settings > Pages`.
4. Set the source to deploy from the main branch root.
5. Your site URL will look like:
   `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

## Netlify

1. Create a new site on Netlify.
2. Drag and drop the full folder:
   `C:\Users\4001C\Desktop\CODEX\google-review-qr`
3. Netlify will publish the site automatically.
4. Your site URL will look like:
   `https://your-site-name.netlify.app/`

## After deployment

Once you have the public site URL, generate a new QR that points to that URL instead of directly to Google.

Example:

```powershell
python .\generate_google_review_qr.py --url "https://your-site-name.netlify.app/" --business "B.B. Synthetics" --tagline "Scan to open a ready-made Google review draft."
```
