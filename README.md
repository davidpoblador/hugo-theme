# hugo-theme

Shared Hugo theme for [davidpoblador.com](https://davidpoblador.com) and [poblador.cat](https://poblador.cat).

Monospace-first, minimal personal site theme with sidebar navigation, blog, projects page, dark mode, and i18n support.

## Features

- Sidebar layout with identity, navigation, social links
- Blog with year-grouped post list, tags, and RSS
- Projects page with status-grouped list and color-coded badges
- Three-way dark mode toggle (system/light/dark)
- i18n support (English and Catalan)
- Tailwind CSS with configurable accent color

## Usage

Add as a Hugo theme (submodule):

```sh
git submodule add https://github.com/davidpoblador/hugo-theme.git themes/hugo-theme
```

Set in `hugo.toml`:

```toml
theme = "hugo-theme"
```

## Deep dives

Deep dives are bespoke, self-contained single-page essays with their own inline
CSS and JS, unrelated to the theme's styling. The theme owns the `<head>` and a
shared footer, so you never hand-copy analytics, SEO, or contact links again —
you only write the body.

### Adding one (the whole recipe)

The deep-dive **section** differs per site: `deep-dives` on davidpoblador.com
(English), `en-profunditat` on poblador.cat (Catalan). Use the site's own
section name below.

Two files, in two trees:

```
content/<section>/<slug>.md         ← front matter only (drives head + listing)
assets/<section>/<slug>/body.html   ← the essay body (your <style>, markup, <script>)
```

`<slug>` is the filename; it becomes the URL `/<section>/<slug>/`.

**1. Front matter** — `content/<section>/<slug>.md`:

```toml
+++
title = "Short title"                 # shown in the listing
date = 2026-06-29                      # publish date; shown in the listing, sorts it
description = "One-line summary."       # meta description, OpenGraph, and listing blurb
type = "deep-dive"                     # REQUIRED — selects the deep-dive layout
outputs = ["html"]                     # skip the .md/llms output; a bespoke page has no markdown

[params]
# Optional. Stylised browser <title>. Without it the title is "<title> — <site>".
htmlTitle = "The Descent — Short title"
# Optional. footer = false  to suppress the shared footer for this essay.
+++
```

**2. Body** — `assets/<section>/<slug>/body.html`: everything that goes *inside*
`<body>` (no `<body>` tag — the layout adds it). Put the essay's CSS in a
`<style>` at the top, then the markup, then any `<script>`. It is injected
verbatim (not markdown-processed), so inline `<style>`/`<script>` survive
untouched. Start the file with the two `ABOUTME:` comment lines like any source
file.

**3. Images** (only if the essay uses them): put them under
`static/<section>/<slug>/assets/…` and reference them relatively as
`assets/…` in the body. The pretty directory URL makes the relative paths
resolve.

That's it — the listing at `/<section>/` picks the essay up automatically (newest
first, with its date) and links to it. No index to maintain.

### What the theme provides (don't hand-roll these)

- Umami analytics (`analyticsID`/`analyticsSrc` from the site's `hugo.toml`) —
  correct per site, impossible to forget
- canonical URL, description, author, favicons, `theme-color`
- OpenGraph + Twitter card tags, `og:image` (site photo, or `params.ogImage`)
- a **shared footer**: the site's social links, Telegram channels, and newsletter
  (same `hugo.toml` params the sidebar uses, so always in the right language),
  a "Share on Hacker News" button on sites with `enableHackerNews = true`, and a
  "back to <section>" link. It inherits the essay's colours, blending into a
  light or dark design.

So **do not** write your own `<head>`, analytics snippet, or a colophon full of
social/contact links and a back-link — the footer already covers them. If a
prepared document ends with an author's note or editorial sign-off, keep that
prose but drop any social-link row or "back to …" link from it.

### Site setup (once per site)

For the section to publish as pretty directory URLs (`/section/slug/`, needed so
relative `assets/…` resolve), the site's `hugo.toml` sets `uglyURLs` as a map
with that section `= false` and everything else `= true`. New top-level sections
default to pretty there — add them as `true` to keep `.html`. Hacker News sharing
is enabled with `enableHackerNews = true` under `[params]` on English sites only.

## Accent color

Override the default accent in your site's `css/input.css`:

```css
@theme {
  --color-accent: oklch(0.646 0.222 41.116); /* orange-600 */
}
```

## License

MIT
