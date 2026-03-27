# Google Review QR Generator

Generate a branded Google review QR poster image from a review link.

This folder also contains a deploy-ready review assistant page for GitHub Pages or Netlify.

## Quick Use

```powershell
python .\generate_google_review_qr.py --url "https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID" --business "My Business"
```

The output file is created at:

`C:\Users\4001C\Desktop\CODEX\google-review-qr\google-review-qr-poster.png`

## Notes

- Replace `YOUR_PLACE_ID` with your real Google review place ID or direct review link.
- You can also change the text with `--business`, `--tagline`, and `--out`.
- To host the review assistant page publicly, use `index.html` and follow [DEPLOY.md](C:\Users\4001C\Desktop\CODEX\google-review-qr\DEPLOY.md).
