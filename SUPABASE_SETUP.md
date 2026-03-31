# Supabase Global Review Pool Setup

This setup gives you a shared pool of 10,000 review drafts.
It now acts as the fallback source when the AI review generator is unavailable.

## What it solves

- Every device pulls the next globally unused review.
- A review is not shown again on another device until the full pool is exhausted or reset.
- Netlify can use this pool as a backup draft source behind the AI-first flow.

## Files

- `supabase-schema.sql`
- `generate_review_pool.py`
- `review-pool.csv`
- `supabase-config.js`

## 1. Create the 10,000 review file

Run:

```powershell
python "D:\OneDrive\CODEX BB\google-review-qr\generate_review_pool.py"
```

This creates:

`D:\OneDrive\CODEX BB\google-review-qr\review-pool.csv`

## 2. Create a Supabase project

In Supabase:

1. Create a new project.
2. Open the SQL Editor.
3. Paste the contents of `supabase-schema.sql`.
4. Run it.

## 3. Import the review pool

In Supabase:

1. Open the `Table Editor`.
2. Open `review_pool`.
3. Use the import option.
4. Upload `review-pool.csv`.

## 4. Add your project keys to the site

Open:

`D:\OneDrive\CODEX BB\google-review-qr\supabase-config.js`

Replace:

- `YOUR_PROJECT_REF`
- `YOUR_SUPABASE_ANON_KEY`

with your actual Supabase values.

## 5. Deploy the updated files

Deploy or upload these files:

- `index.html`
- `review-page.js`
- `supabase-config.js`

Your hosted review page will then be able to fall back to the Supabase-backed global review pool.

## 6. Reset after 10,000 reviews are consumed

In Supabase SQL Editor, run:

```sql
select public.reset_review_pool();
```

## Important note

This is globally non-repeatable only because Supabase stores the shared used/unused state.
Static hosting alone cannot do that.
