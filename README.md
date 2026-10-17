# artyomblack.com

Website for Artyom Black's games and apps, live at https://artyomblack.com (repo: artyom-black.github.io).
Each app has its own folder. The homepage reads `apps.json` and builds itself from those folders.

## Structure

```
index.html           homepage
apps.json            list of app folders, in display order
app-ads.txt          AdMob file (must stay in the root)
assets/              shared website code, styles and logos
template/            blank app folder for new apps

i-love-kanji/
tintora-sort/
tunnel-ride/
```

Every app folder has the same layout:

```
app-name/
  index.html                    app page (identical in every app, don't edit)
  privacy-policy/index.html     Privacy Policy
  terms-of-service/index.html   Terms of Service
  assets/
    info.json                   name, Google Play link, description
    icon.webp                   app icon
    poster.jpg                  card image (9:16)
    gameplay.mp4                gameplay video (optional)
    animation.js                opening animation and page background (optional)
    animation.css               styles for the animation (optional)
```

## Add a new app

1. Copy `template/` and rename it to the app name in lowercase with dashes (for example `new-app`).
2. Fill in `privacy-policy/index.html` and `terms-of-service/index.html`.
3. Add `icon.webp`, `poster.jpg` and optionally `gameplay.mp4` to `assets/`.
4. Fill in `assets/info.json`.
5. In `assets/animation.js` and `assets/animation.css`, replace `my-new-app` with the folder name and write the animation,
   or delete both files to use the default animation.
6. Add the folder name to `apps.json`.

To hide an app, remove it from `apps.json`. To reorder apps, reorder the list.

## info.json

| Field | Required | Description |
|---|---|---|
| `name` | yes | App name |
| `kind` | yes | `"Game"` or `"App"` (which tab it appears in) |
| `genre` | yes | Short label, e.g. `"Puzzle"` |
| `subtitle` | no | Shown under the name instead of the genre |
| `line` | no | One-sentence description |
| `color` | no | Accent color for the default animation |
| `googlePlay` | no | Google Play link; without it the app shows "Coming soon" |
| `comingSoon` | no | `true` to show a "Coming soon" badge |
| `icon`, `poster`, `video` | | File names in `assets/` |
| `facts` | no | List shown as "How it plays" |
| `chips` | no | Short tags shown as "Inside" |
| `gallery` | no | Images with names (see `tunnel-ride/assets/info.json`) |
| `privacy`, `terms` | no | `false` hides that link |
| `oldIds` | no | Old short names that should still open the app |

If an `info.json` is invalid, only that app is skipped.

## Animations

- `animation.js` calls `Site.register("folder-name", { world, opening, onOpen, timing })`. Every part is optional.
  - `world(app)` returns HTML for the app page background.
  - `opening(app)` returns HTML for the opening animation.
  - `onOpen(page, app)` runs extra effects, e.g. `page.classList.add("shake")`.
  - `timing: { fly, reveal }` sets the icon flight time and when the text appears, in milliseconds.
  - `app.url("file.webp")` returns the path to a file in the app's `assets/` folder.
- Every rule in `animation.css` starts with `[data-app="folder-name"]`.
  `[data-app="folder-name"].opening` applies while the opening animation plays.
  `--cx` / `--cy` hold the position of the tapped icon.
- Use a short unique prefix for classes and `@keyframes` (e.g. `tr-`, `ilk-`).

If an animation is missing or throws an error, the default animation is used.

## Notes

- `tintora-sort/assets/tintora_sort_android_version.json` is Tintora Sort's update-check file, moved from the old `TintoraSort-InfoSite` repo.
- `assets/in-app.js` helps visitors who open the site inside TikTok, Instagram or Facebook: a small "Better in Chrome" bar, and on Android the install button tries the Play Store app first, then offers to continue in Chrome. Other visitors see no change.
