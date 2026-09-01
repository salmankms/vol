# Vows of Love (VOL)

Static marketing site for Vows of Love — a documentary-driven wedding photography and film studio. Hand-coded HTML/CSS/JS, no build step.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home |
| `about.html` | About VOL |
| `how-to-plan-a-wedding.html` | 11-step planning guide |
| `terms-and-conditions.html` | Booking / usage terms |

## Structure

```
css/styles.css     all styles
js/main.js          mobile nav + scroll-reveal
images/             AVIF/WebP assets
favicon.svg
robots.txt · sitemap.xml
```

## Run locally

```bash
python3 -m http.server 8777
```

Then open http://localhost:8777/.

## Notes

- Fonts load from Google Fonts; the contact form is an embedded Studio Ninja iframe — both need network access.
- SEO canonical/OG tags use `https://vowsoflove.in/` as the base — update if the production domain differs.
