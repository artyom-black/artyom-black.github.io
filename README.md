# artyom-black.github.io

Website for Artyom Black's games and apps.
Every app has its own folder. The homepage reads those folders and builds itself, so **adding an app never means editing the website code**.

## Structure

```
index.html        homepage
apps.json         list of app folders, in the order they appear   ← edit this to add an app
app-ads.txt       AdMob file (must stay in the root)
assets/           shared website code, styles and logos
template/         blank app folder to copy for a new app

tunnel-ride/
  index.html              the app's page on the website (same file for every app, don't edit)
  privacy-policy/index.html
  terms-of-service/index.html
  assets/                 everything else for this app
    info.json               name, Google Play link, description...
    icon.webp  poster.jpg  gameplay.mp4
    animation.js            this app's opening animation and background
    animation.css           styles for that animation
    ...                     any other pictures the app page uses
i-love-kanji/     same layout
tintora-sort/     same layout
```

## Links

| Page | Address |
|---|---|
| Homepage | https://artyom-black.github.io/ |
| App page | https://artyom-black.github.io/tunnel-ride/ |
| Privacy Policy | https://artyom-black.github.io/tunnel-ride/privacy-policy/ |
| Terms of Service | https://artyom-black.github.io/tunnel-ride/terms-of-service/ |

Same pattern for every app (`i-love-kanji`, `tintora-sort`, ...).
Opening an app on the homepage changes the address to `/app-name/`, and the back button closes it.
Use the **privacy-policy** address in Google Play Console.

## Add a new app

1. **Copy** the `template` folder and rename the copy to the app's name in lowercase with dashes, like `space-cats`.
   No spaces or capitals; this name becomes the address `artyom-black.github.io/space-cats/`.
2. **Policies:** fill in the `[BRACKETS]` in `space-cats/privacy-policy/index.html` and `space-cats/terms-of-service/index.html`,
   or replace them with your own pages (keep the file names).
3. **Pictures:** put `icon.webp` and `poster.jpg` in `space-cats/assets/` (and `gameplay.mp4` if you have one).
4. **Info:** fill in `space-cats/assets/info.json` (fields below).
5. **Animation:** in `assets/animation.js` and `assets/animation.css`, change `my-new-app` to `space-cats`,
   then write your own animation. Or delete both files to use the default animation.
6. **Add one line to `apps.json`:**
   ```json
   [
     "tintora-sort",
     "tunnel-ride",
     "i-love-kanji",
     "space-cats"
   ]
   ```
   Every name in quotes, a comma after every line except the last.
7. Upload. The app appears with its card, animation and Privacy / Terms links.
8. In Google Play Console, set the privacy policy URL to `https://artyom-black.github.io/space-cats/privacy-policy/`.

Don't edit `space-cats/index.html`. It's the same small file in every app folder and opens the app from the folder name.

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
| `icon`, `poster`, `video` | | File names in `assets/`. `video` is optional |
| `facts` | no | List shown as "How it plays" |
| `chips` | no | Short tags shown as "Inside" |
| `gallery` | no | Pictures with names, like Tunnel Ride's monsters |
| `privacy`, `terms` | no | Set to `false` to hide that link |
| `oldIds` | no | Old short names so links like `/#tunnel` still open the app |

`info.json` must be valid JSON: double quotes, commas between items, none after the last.
If one app's `info.json` has a mistake, only that app is skipped. The rest of the site still works.

## Animation rules (for you or an AI writing one)

Give the AI this section and the files in `template/assets/` as a starting point.

- `animation.js` calls `Site.register("folder-name", { world, opening, onOpen, timing })`. All parts are optional.
  - `world(app)` returns HTML for the app page background.
  - `opening(app)` returns HTML for the one-time opening animation.
  - `onOpen(page, app)` runs extra effects, for example `page.classList.add("shake")`.
  - `timing: { fly, reveal }` in milliseconds: how long the icon flies, and when the text appears.
  - `app.url("file.webp")` gives the right path to a file in the app's `assets/` folder.
- Every rule in `animation.css` starts with `[data-app="folder-name"]` so it can't affect other apps.
  `[data-app="folder-name"].opening` means "while the opening animation plays".
  `--cx` / `--cy` are where the tapped icon was on screen.
- Give classes and `@keyframes` a short unique prefix (Tunnel Ride uses `tr-`, I Love Kanji `ilk-`).
- The card shelf, opening flow, swipe-to-close and links are shared. Don't copy them into the app folder.

If an app's animation is missing or has an error, the site uses the default animation for that app.

## Tintora Sort update check

`tintora-sort/assets/tintora_sort_android_version.json` is a copy of the update-check file from the old `TintoraSort-InfoSite` repo.
If the game reads it from the old address, keep that old repo until a game update points to the new address:
`https://artyom-black.github.io/tintora-sort/assets/tintora_sort_android_version.json`

## Custom domain (later)

Everything keeps working with a domain like `artyomblack.com`; links become `artyomblack.com/space-cats/privacy-policy/`.
Set it in this repo's Settings → Pages, then update the links in Google Play Console.
