# Skyworth Label Generator — published build

Everything in this folder is the application. It is **static**: no build step, no
server code, no dependencies to install. Open `index.html` and it runs.

## Publishing to GitHub Pages

Commit this folder as `docs/` at the root of the repository, then in
**Settings → Pages** set *Source* to **Deploy from a branch**, branch `main`,
folder **`/docs`**.

The site entry point is `index.html`.

## Why `.nojekyll` is here

GitHub Pages runs Jekyll by default, which **silently drops any file or folder
whose name begins with an underscore**. The empty `.nojekyll` file turns that off.
Nothing here starts with an underscore today, so it changes nothing now — it is
there so a file added later cannot disappear from the published site without
anyone noticing.

## Paths are relative, and case matters

Every reference is relative (`../../../vendor/…`), so the site works from a
repository subpath such as `https://<user>.github.io/<repo>/`.

Pages serves from Linux, which is **case-sensitive**; Windows is not. A path
whose case does not match its file works locally and 404s once published. All
533 references across the 32 pages were resolved against the real filenames with
exact case before this folder was made, and the whole site was then served over
HTTP through a deliberately case-sensitive server: portal, release notes, a
generator, the language toggle and a PDF download all work, with no 404s.

## Two things to confirm before making the repository public

1. **The pages embed the JioType font** as base64 inside the HTML. Publishing
   them publishes the font. The repository's own `.gitignore` excludes `*.ttf` as
   "source material — shared offline, never published", which is the same
   material travelling a different way. Check the licence allows it, or keep the
   repository private.

2. **The default values are real reference identifiers** — MAC IDs, CHIP IDs,
   EANs and serials taken from the approved artwork. The interface marks them as
   examples, but they are still real numbers on a public page.

Neither stops the site working. Both are decisions for whoever owns the artwork.

## What is not here

The verification scripts (`check_rules.js`, `test_i18n.js`, `test_pdf_all.js`)
stay in the parent folder. They are development tools and are not needed to run
or serve the application.
