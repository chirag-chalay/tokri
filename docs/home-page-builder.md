# Home page builder

Admin path: **Home page builder** (Content permission required).

## What it does

- Separate layouts for **Website** and **Mobile app** (independent drafts — no copy between them)
- Draft vs published: edits stay private until **Publish**
- Shared sections: banner slider, category strip, product rail, category products
- Website-only: image banner, reviews, blog posts
- App-only: mobile banner, promo slider (peeking image cards)
- Drag or use ↑↓ to reorder; hide, duplicate, or delete sections
- History keeps the last 20 published versions; restore puts a version back into the draft

## Workflow

1. Open **Home page builder**
2. Choose **Website** or **Mobile app**
3. Add sections, set titles, images, product sources, and links
4. **Save draft** (or let live preview auto-save when you refresh preview)
5. Check the middle preview; optionally **Open real preview** for the website (`/?homePreview=…`)
6. **Publish** when ready — storefront and app (new builds) read the published layout from `GET /api/v1/home?platform=web|mobile`

If nothing is published yet, the website and app keep the previous hardcoded home (Settings banner fields + bootstrap).

## Image tips

- **Website** banner / image banner: Desktop image + Mobile image (responsive site)
- **Mobile app** banner slider / mobile banner / promo slider: single Image + link per slide/card
- Empty extra slides are ignored until Publish (at least one slide with an image is required)
- Banner desktop ~4:1, mobile/app ~2:1; promo cards ~3:2
- Uploads go to `/uploads/home/` via the builder (admin session required)

## API

- Public: `GET /api/v1/home?platform=web|mobile`
- Draft preview: add `&previewToken=…` (30 minutes, signed)
- Response `sections: null` means “use legacy home”

## Compatibility

- Store apps that do not call `/home` keep working
- Do not remove Settings home fields or bootstrap home data until old builds stop needing them (see `docs/app-later.md`)
