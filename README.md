# artyom-black.github.io

Website for Artyom Black's games and apps.
Every app lives in its own folder. The homepage reads those folders and builds itself, so **adding an app never means editing the website code**.

## What's in this repo

```
index.html              the homepage (shared, don't need to touch)
apps.json               the list of app folders, in the order they appear  ← you edit this
site/                   shared code, styles and logos for the whole website
  app.js                builds cards, opening/closing, swipe, links
  style.css             look of the homepage and app pages
  policy.css            look of policy pages made from the template
  img/                  logos, favicon, share image
_template/              blank app folder to copy for a new app (not shown on the site)

tintora-sort/           one folder per app ↓
tunnel-ride/
i-love-kanji/
  info.json             name, Google Play link, description...
  art/                  icon, poster, gameplay video, backgrounds, sprites
  animations/
    main.js             this app's own opening animation and background
    style.css           styles for that animation
  privacy/index.html    Privacy Policy  →  /i-love-kanji/privacy/
  terms/index.html      Terms of Service → /i-love-kanji/terms/

TintoraSort-InfoSite/         old addresses, kept so old links keep working
ILoveKanji-info/              (see "Old links" below, don't delete)
tunnel-ride-privacy-policy/
app-ads.txt                   AdMob file. Must stay in the root.
```

## Add a new app

1. **Copy** the `_template` folder and rename the copy to your app's name in lowercase with dashes, like `space-cats`.
   (No spaces, no capitals. This name becomes the link: `artyom-black.github.io/space-cats/privacy/`.)
2. **Add your pictures** to `space-cats/art/`: `icon.webp` and `poster.jpg` (needed), `gameplay.mp4` (optional).
3. **Fill in `space-cats/info.json`**: name, Google Play link, description and so on (fields explained below).
4. **Write the policies**: fill in the `[BRACKETS]` in `privacy/index.html` and `terms/index.html`,
   or replace those files with your own pages. Just keep the names `privacy/index.html` and `terms/index.html`.
5. **Animation**: in `animations/main.js` and `animations/style.css`, change `my-new-app` to `space-cats` everywhere,
   then replace the example with your own animation. Or delete both files to use the default animation.
6. **Add one line to `apps.json`** with the folder name:
   ```json
   [
     "tintora-sort",
     "tunnel-ride",
     "i-love-kanji",
     "space-cats"
   ]
   ```
   Every name needs quotes, and every line except the last needs a comma.
7. Upload. Your app appears on the website with its card, opening animation and Privacy / Terms links.
8. In **Google Play Console**, set the app's privacy policy URL to `https://artyom-black.github.io/space-cats/privacy/`.

To hide an app, remove its line from `apps.json`. To reorder apps, reorder the lines.

## info.json fields

| Field | Needed? | What it is |
|---|---|---|
| `name` | yes | App name on the card and page |
| `kind` | yes | `"Game"` or `"App"`, which tab it shows in |
| `genre` | yes | Small label, like `"Puzzle"` |
| `subtitle` | no | Shown under the name instead of the genre, like `"Survival Shooter"` |
| `line` | no | One-sentence description |
| `color` | no | Main color, used by the default animation |
| `googlePlay` | no | Google Play link. Leave it out to show "Coming soon" |
| `comingSoon` | no | `true` to show a "Coming soon" badge |
| `icon`, `poster`, `video` | | Files in `art/`. `video` is optional |
| `privacy`, `terms` | no | Usually `"privacy/"` and `"terms/"`. Leave one out to hide that link |
| `facts` | no | List shown as "How it plays" |
| `chips` | no | List of short tags shown as "Inside" |
| `gallery` | no | Pictures with names, like Tunnel Ride's monsters (see `tunnel-ride/info.json`) |
| `oldIds` | no | Old short names so old links like `/#tunnel` still open the app |

`info.json` must be valid JSON: double quotes, commas between items, no comma after the last one.
If one app's `info.json` has a mistake, only that app is skipped; the rest of the site still works.

## Animation rules (for you or an AI writing one)

Give the AI this section and the `_template/animations` files as a starting point.

- `main.js` calls `Site.register("folder-name", { world, opening, onOpen, timing })`. All parts are optional.
  - `world(app)` returns HTML for the app page background.
  - `opening(app)` returns HTML for the one-time opening animation.
  - `onOpen(page, app)` runs extra effects (for example `page.classList.add("shake")`).
  - `timing: { fly, reveal }` in milliseconds: how long the icon flies, and when the text appears.
  - `app.url("art/file.webp")` gives the right path to a file in this app's folder.
- Every rule in `style.css` starts with `[data-app="folder-name"]` so it can't affect other apps.
  `[data-app="folder-name"].opening` means "while the opening animation plays".
  `--cx` / `--cy` are where the tapped icon was on the screen.
- Give classes and `@keyframes` a short unique prefix (Tunnel Ride uses `tr-`, I Love Kanji `ilk-`).
- In `style.css`, image paths start with `../art/`.
- The card shelf, opening flow, swipe-to-close and links are shared. Don't copy them into the app folder.

If an app's animation is missing or has an error, the site uses a default animation for that app instead.

## Old links

These folders keep old addresses working (like the ones already in Google Play Console):

- `/TintoraSort-InfoSite/` → `/tintora-sort/privacy/`
- `/ILoveKanji-info/` → `/i-love-kanji/privacy/`
- `/tunnel-ride-privacy-policy/` → `/tunnel-ride/privacy/`

They only take over **after** the old repos with those names are deleted (or have GitHub Pages turned off).
Until then, the old repos still answer at those addresses.

`TintoraSort-InfoSite/tintora_sort_android_version.json` is a copy of the update-check file from the old Tintora Sort repo.
If the game reads it from that address, it keeps working after the old repo is deleted. Edit it here from now on.

## Custom domain (later)

Everything above keeps working with a domain like `artyomblack.com`; links just become `artyomblack.com/space-cats/privacy/`.
Set it in this repo's Settings → Pages, then update the links in Google Play Console.
